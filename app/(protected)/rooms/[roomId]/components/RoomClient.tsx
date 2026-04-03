"use client";

import { useYjsStore } from "@/hooks/useYjsStore";
import "tldraw/tldraw.css";
import {
  createShapeId,
  Editor,
  Tldraw,
  TLUiToolsContextType,
  toRichText,
} from "tldraw";
import { useCallback, useState } from "react";
import { RoomHeader } from "./RoomHeader";

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

      // 1. Disable dropping/pasting new files onto the canvas
      mountedEditor.registerExternalContentHandler("files", () => {
        // By returning nothing, we prevent the default shape creation
        console.log("Inserting File is Not Allowed.");
      });

      // 2. Disable dropping files on top of existing shapes (file replacement)
      mountedEditor.registerExternalContentHandler("file-replace", () => {
        console.log("File replacement is Not Allowed.");
      });

      // 3. Disable dragging/pasting URLs or raw SVG text
      mountedEditor.registerExternalContentHandler("url", () => {
        console.log("Inserting URL is Not Allowed.");
      });
      mountedEditor.registerExternalContentHandler("svg-text", () => {
        console.log("Inserting SVG is Not Allowed.");
      });

      setEditor(mountedEditor);
    },
    [user.id, user.name, user.color],
  );
  const handleMockAiResponse = async () => {
    if (!editor) return;

    // Get the center of the current viewport so the AI draws right in front of the user
    const center = editor.getViewportPageBounds().center;

    // 1. Loading/Thinking State (Canvas as Output)
    const textId = createShapeId();
    editor.createShape({
      id: textId,
      type: "text",
      x: center.x - 120,
      y: center.y - 150,
      props: {
        richText: toRichText(" AI is thinking..."),
        color: "violet",
        size: "m",
      },
    });

    // Simulate network latency / LLM processing time
    await new Promise((res) => setTimeout(res, 1200));

    editor.updateShape({
      id: textId,
      type: "text",
      props: { richText: toRichText(" AI: Here is your visual workflow:") },
    });

    // 2. Simulate AI drawing shapes sequentially (AI Agent Pattern)
    await new Promise((res) => setTimeout(res, 600));
    const box1Id = createShapeId();
    editor.createShape({
      id: box1Id,
      type: "geo",
      x: center.x - 200,
      y: center.y - 60,
      props: {
        geo: "rectangle",
        w: 150,
        h: 60,
        richText: toRichText("User Input"),
        color: "blue",
        fill: "semi",
      },
    });

    await new Promise((res) => setTimeout(res, 600));
    const box2Id = createShapeId();
    editor.createShape({
      id: box2Id,
      type: "geo",
      x: center.x + 50,
      y: center.y - 60,
      props: {
        geo: "diamond",
        w: 150,
        h: 100,
        richText: toRichText("LLM Node"),
        color: "light-violet",
        fill: "solid",
      },
    });

    await new Promise((res) => setTimeout(res, 600));
    const arrowId = createShapeId();
    editor.createShape({
      id: arrowId,
      type: "arrow",
      props: { color: "black", dash: "draw" },
    });

    // 3. Bind the arrows perfectly to the shapes so they stay connected if the user moves them
    editor.createBinding({
      type: "arrow",
      fromId: arrowId,
      toId: box1Id,
      props: {
        terminal: "start",
        normalizedAnchor: { x: 0.5, y: 0.5 },
        isExact: false,
      },
    });

    editor.createBinding({
      type: "arrow",
      fromId: arrowId,
      toId: box2Id,
      props: {
        terminal: "end",
        normalizedAnchor: { x: 0.5, y: 0.5 },
        isExact: false,
      },
    });

    // 4. Focus the camera on the newly generated content
    editor.select(box1Id, box2Id, arrowId);
    editor.zoomToSelection({ animation: { duration: 500 } });
    editor.selectNone();
  };
  if (storeWithStatus.status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center">
        Loading Room...
      </div>
    );
  }
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#F8F9FA]">
      <RoomHeader
        roomName={roomName}
        user={user}
        activeUsers={activeUsers}
        roomId={roomId}
        editor={editor}
      />

      <div className="absolute inset-0 z-0">
        <Tldraw
          store={storeWithStatus.store}
          onMount={handleMount}
          overrides={uiOverrides}
        />
      </div>
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
        <button
          onClick={handleMockAiResponse}
          disabled={!editor}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white rounded-full shadow-xl transition-transform hover:scale-105 active:scale-95 font-medium"
        >
          <span> Simulate AI Diagram</span>
        </button>
      </div>
    </div>
  );
}
