"use client";

import { useYjsStore } from "@/hooks/useYjsStore";
import "tldraw/tldraw.css";
import { Editor, Tldraw, TLUiToolsContextType } from "tldraw";
import { useCallback, useState } from "react";
import { RoomHeader } from "./RoomHeader";
import { useDiagramAI } from "../hooks/useDiagramAI";
import LoadingSpinner from "./LoadingSpinner";
import { DynamicAlert } from "@/components/ui/alert";
import { AIToolbar } from "./AIToolbar";

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
  const {
    actionState,
    explanation,
    setExplanation,
    explainDiagram,
    autocompleteDiagram,
    generateFromPrompt,
    alertState,
    setAlertState,
  } = useDiagramAI(editor);

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
      {alertState && (
        <DynamicAlert
          variant={alertState.variant}
          layout={alertState.layout}
          title={alertState.title}
          message={alertState.message}
          onClose={() => setAlertState(null)}
          className="z-2000"
        />
      )}
      <AIToolbar
        actionState={actionState}
        disabled={!editor}
        explanation={explanation}
        setExplanation={setExplanation}
        onGenerate={generateFromPrompt}
        onExplain={explainDiagram}
        onAutocomplete={autocompleteDiagram}
      />
      <div className="absolute inset-0 z-0">
        <Tldraw
          store={storeWithStatus.store}
          onMount={handleMount}
          overrides={uiOverrides}
        />
      </div>
    </div>
  );
}
