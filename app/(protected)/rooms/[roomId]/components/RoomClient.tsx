"use client";

import { useYjsStore } from "@/hooks/useYjsStore";
import "tldraw/tldraw.css";
import { Editor, Tldraw, TLUiToolsContextType } from "tldraw";
import { useCallback, useState } from "react";
import { RoomHeader } from "./RoomHeader";
import ReactMarkdown from "react-markdown";
import { useDiagramAI } from "../hooks/useDiagramAI";

const uiOverrides = {
  tools: (_editor: Editor, tools: TLUiToolsContextType) => {
    delete tools.asset;
    return tools;
  },
};

const Spinner = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg
    className={`animate-spin ${className}`}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    ></circle>
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    ></path>
  </svg>
);
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
  const [prompt, setPrompt] = useState("");
  const {
    actionState,
    explanation,
    setExplanation,
    explainDiagram,
    autocompleteDiagram,
    generateFromPrompt,
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
  const handleAiResponse = async (e: React.SubmitEvent) => {
    e.preventDefault();
    generateFromPrompt(prompt);
  };
  const isBusy = actionState !== "idle";
  if (storeWithStatus.status === "loading") {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 bg-[#F8F9FA]">
        <Spinner className="w-10 h-10 text-indigo-600" />
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

      {explanation && (
        <div className="absolute top-24 right-8 w-96 bg-white p-6 rounded-xl shadow-2xl border border-gray-100 z-20 max-h-[70vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg text-indigo-600">AI Analysis</h3>
            <button
              onClick={() => setExplanation(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
          <div className="prose prose-sm text-gray-700 whitespace-pre-wrap">
            <ReactMarkdown>{explanation}</ReactMarkdown>
          </div>
        </div>
      )}

      {/* Floating Toolbar */}
      <div className="absolute bottom-28 left-1/2 -translate-x-1/2 z-10 w-full max-w-md">
        <form
          onSubmit={handleAiResponse}
          className="flex items-center gap-2 bg-white p-2 rounded-full shadow-2xl border border-gray-200"
        >
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., Draw an AWS microservice architecture..."
            className="flex-1 px-4 py-2 outline-none rounded-full bg-transparent text-gray-800 placeholder-gray-400"
            disabled={!editor || isBusy}
          />
          <button
            type="submit"
            disabled={!editor || isBusy || !prompt.trim()}
            className="flex items-center gap-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white rounded-full transition-transform hover:scale-105 active:scale-95 font-medium"
          >
            {actionState === "generating" ? (
              <>
                <Spinner /> Drawing
              </>
            ) : (
              "Generate"
            )}
          </button>
        </form>
      </div>
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-10 flex gap-4 bg-white p-2 rounded-full shadow-2xl border border-gray-200">
        <button
          onClick={explainDiagram}
          disabled={!editor || isBusy}
          className="px-6 py-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-800 rounded-full transition-transform active:scale-95 font-medium"
        >
          {actionState === "explaining" ? (
            <>
              <Spinner className="text-slate-500 w-5 h-5" /> Analyzing...
            </>
          ) : (
            "🧐 Explain Diagram"
          )}
        </button>

        <button
          onClick={autocompleteDiagram}
          disabled={!editor || isBusy}
          className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-full transition-transform active:scale-95 font-medium shadow-md shadow-indigo-200"
        >
          {actionState === "completing" ? (
            <>
              <Spinner /> Completing...
            </>
          ) : (
            "✨ Auto-Complete"
          )}
        </button>
      </div>
    </div>
  );
}
