"use client";

import { useYjsStore } from "@/hooks/useYjsStore";
import "tldraw/tldraw.css";
import { Editor, Tldraw, TLUiToolsContextType } from "tldraw";
import { useCallback, useState } from "react";
import { RoomHeader } from "./RoomHeader";
import LoadingSpinner from "./LoadingSpinner";
import { AIToolbar } from "./AIToolbar";
import { Button } from "@/components/ui/button";
import { TemplateSelector } from "./TemplateSelector";

const uiOverrides = {
  tools: (_editor: Editor, tools: TLUiToolsContextType) => {
    delete tools.asset;
    return tools;
  },
};

export default function RoomClient({
  roomId,
  roomName,
  user,
}: {
  roomId: string;
  roomName: string;
  user: { id: string; name: string; color: string };
}) {
  const [editor, setEditor] = useState<Editor | null>(null);
  const [showStylePanel, setShowStylePanel] = useState(false);

  const { storeWithStatus, activeUsers } = useYjsStore({
    roomId,
    hostUrl: process.env.NEXT_PUBLIC_YJS_URL || "",
    user,
  });

  const handleMount = useCallback(
    (mountedEditor: Editor) => {
      mountedEditor.user.updateUserPreferences({
        id: user.id,
        name: user.name,
        color: user.color,
      });
      mountedEditor.registerExternalContentHandler("files", () => {});
      mountedEditor.registerExternalContentHandler("file-replace", () => {});
      mountedEditor.registerExternalContentHandler("url", () => {});
      mountedEditor.registerExternalContentHandler("svg-text", () => {});

      setTimeout(() => {
        mountedEditor.zoomToFit({ animation: { duration: 0 } });
      }, 50);

      setEditor(mountedEditor);
    },
    [user],
  );
  if (storeWithStatus.status === "loading") {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 bg-[#F8F9FA]">
        <LoadingSpinner className="w-10 h-10 text-[#285a48]" />
        <p className="text-gray-600 font-medium animate-pulse">
          Loading Room...
        </p>
      </div>
    );
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#F8F9FA]">
      <RoomHeader
        roomName={roomName}
        activeUsers={activeUsers}
        roomId={roomId}
        editor={editor}
      />

      <Button
        type="button"
        onClick={() => setShowStylePanel((prev) => !prev)}
        className="absolute top-2 right-40 z-2000 rounded-md bg-white px-3 py-1.5 text-xs font-medium shadow-md border border-gray-200 text-[#091413] hover:bg-gray-50 transition-colors"
      >
        {showStylePanel ? "Hide" : "Show Styles Panel"}
      </Button>

      <AIToolbar editor={editor} disabled={!editor} />
      <div className="absolute inset-0 z-0">
        <Tldraw
          store={storeWithStatus.store}
          onMount={handleMount}
          overrides={uiOverrides}
          components={showStylePanel ? undefined : { StylePanel: () => null }}
        />
      </div>
    </div>
  );
}
