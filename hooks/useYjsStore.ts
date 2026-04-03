import { useEffect, useState } from "react";
import {
  createTLStore,
  defaultShapeUtils,
  InstancePresenceRecordType,
  TLRecord,
  TLStoreWithStatus,
  PageRecordType,
  TLInstanceId,
  TLPointerId,
  TLShapeId,
  TLPageId,
} from "tldraw";
import * as Y from "yjs";
import { HocuspocusProvider } from "@hocuspocus/provider";

export type Collaborator = {
  clientId: number;
  id: string;
  name: string;
  color: string;
  isSelf: boolean;
};

interface AwarenessState {
  user?: {
    id: string;
    name: string;
    color: string;
  };
  presence?: {
    currentPageId: TLPageId;
    cursor: { x: number; y: number };
    selectedShapeIds: TLShapeId[];
    lastActivityTimestamp: number;
  };
}

export function useYjsStore({
  roomId,
  hostUrl,
  user,
}: {
  roomId: string;
  hostUrl: string;
  user: { id: string; name: string; color: string };
}) {
  const [storeWithStatus, setStoreWithStatus] = useState<TLStoreWithStatus>({
    status: "loading",
  });

  const [activeUsers, setActiveUsers] = useState<Collaborator[]>([]);

  // 1. Destructure the user object into primitive variables
  const userId = user.id;
  const userName = user.name;
  const userColor = user.color;

  useEffect(() => {
    const store = createTLStore({ shapeUtils: defaultShapeUtils });
    const yDoc = new Y.Doc();
    const yMap = yDoc.getMap<TLRecord>(`tldraw_${roomId}`);

    const provider = new HocuspocusProvider({
      url: hostUrl,
      name: roomId,
      document: yDoc,
    });

    // 2. Reconstruct the user object inside the effect
    provider.awareness?.setLocalStateField("user", {
      id: userId,
      name: userName,
      color: userColor,
    });

    const handleAwarenessChange = () => {
      const states = provider.awareness?.getStates();
      const presences: TLRecord[] = [];
      const users: Collaborator[] = [];

      states?.forEach((rawState: unknown, clientId: number) => {
        const state = rawState as AwarenessState;

        if (state.user) {
          users.push({
            clientId,
            ...state.user,
            isSelf: clientId === provider.awareness?.clientID,
          });
        }

        if (clientId === provider.awareness?.clientID) return;
        if (!state.user || !state.presence) return;

        const presenceId = InstancePresenceRecordType.createId(
          clientId.toString(),
        );

        presences.push(
          InstancePresenceRecordType.create({
            id: presenceId,
            currentPageId:
              state.presence.currentPageId ?? PageRecordType.createId("page"),
            userId: clientId.toString(),
            userName: state.user.name,
            cursor: state.presence.cursor
              ? { ...state.presence.cursor, type: "default", rotation: 0 }
              : { x: 0, y: 0, type: "default", rotation: 0 },
            color: state.user.color,
            lastActivityTimestamp:
              state.presence.lastActivityTimestamp ?? Date.now(),
            selectedShapeIds: state.presence.selectedShapeIds ?? [],
          }),
        );
      });

      setActiveUsers(users);

      store.mergeRemoteChanges(() => {
        const existingPresenceIds = store.query
          .records("instance_presence")
          .get()
          .map((r) => r.id);
        const newPresenceIds = presences.map((p) => p.id);

        const toRemove = existingPresenceIds.filter(
          (id) => !newPresenceIds.includes(id),
        );

        if (toRemove.length > 0) store.remove(toRemove);
        if (presences.length > 0) store.put(presences);
      });
    };

    provider.awareness?.on("change", handleAwarenessChange);

    const handleYjsChange = (event: Y.YMapEvent<TLRecord>) => {
      const toPut: TLRecord[] = [];
      const toRemove: TLRecord["id"][] = [];

      event.changes.keys.forEach((change, key) => {
        if (change.action === "add" || change.action === "update") {
          const record = yMap.get(key);
          if (record) toPut.push(record);
        } else if (change.action === "delete") {
          toRemove.push(key as TLRecord["id"]);
        }
      });

      store.mergeRemoteChanges(() => {
        if (toRemove.length) store.remove(toRemove);
        if (toPut.length) store.put(toPut);
      });
    };

    yMap.observe(handleYjsChange);

    const unlistenStore = store.listen(
      ({ changes }) => {
        yDoc.transact(() => {
          Object.values(changes.added).forEach((record) =>
            yMap.set(record.id, record),
          );
          Object.values(changes.updated).forEach(([_, record]) =>
            yMap.set(record.id, record),
          );
          Object.values(changes.removed).forEach((record) =>
            yMap.delete(record.id),
          );
        });
      },
      { source: "user", scope: "document" },
    );

    const unlistenPresence = store.listen(
      () => {
        const instanceId = "instance:instance" as TLInstanceId;
        const pointerId = "pointer:pointer" as TLPointerId;

        const instance = store.get(instanceId);
        const pointer = store.get(pointerId);

        if (!instance || !pointer) return;

        const pageStates = store.query.records("instance_page_state").get();
        const currentPageState = pageStates.find(
          (ps) => ps.pageId === instance.currentPageId,
        );

        const selectedShapeIds = currentPageState?.selectedShapeIds || [];

        const presencePayload: AwarenessState["presence"] = {
          currentPageId: instance.currentPageId,
          cursor: { x: pointer.x, y: pointer.y },
          selectedShapeIds,
          lastActivityTimestamp: Date.now(),
        };

        provider.awareness?.setLocalStateField("presence", presencePayload);
      },
      { source: "user", scope: "all" },
    );

    provider.on("synced", () => {
      const yjsRecords = Array.from(yMap.values());

      if (yjsRecords.length === 0) {
        yDoc.transact(() => {
          store.allRecords().forEach((record) => {
            if (record.typeName === "shape" || record.typeName === "page") {
              yMap.set(record.id, record);
            }
          });
        });
      } else {
        store.mergeRemoteChanges(() => {
          store.put(yjsRecords);
        });
      }

      setStoreWithStatus({
        status: "synced-remote",
        connectionStatus: "online",
        store,
      });

      handleAwarenessChange();
    });

    return () => {
      unlistenStore();
      unlistenPresence();
      yMap.unobserve(handleYjsChange);
      provider.disconnect();
      yDoc.destroy();
    };
    // 3. Use the primitive values in the dependency array
  }, [roomId, hostUrl, userId, userName, userColor]);

  return { storeWithStatus, activeUsers };
}
