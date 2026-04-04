"use client";

import { Collaborator } from "@/hooks/useYjsStore";
import "tldraw/tldraw.css";
import InviteModal from "./InviteModal";
import { Editor, track } from "tldraw";
import ActiveUsers from "./ActiveUsers";
import Link from "next/link";
import { memo } from "react";
import { ChevronLeft, Moon, Sun } from "lucide-react";

const DarkModeButton = track(({ editor }: { editor: Editor | null }) => {
  if (!editor) return null;

  const isDark = editor.user.getIsDarkMode();

  const handleClick = () => {
    editor.user.updateUserPreferences({
      colorScheme: isDark ? "light" : "dark",
    });
  };

  return (
    <button
      onClick={handleClick}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="group p-2 rounded-full border bg-white hover:bg-gray-100 transition-all shadow-sm flex items-center justify-center"
    >
      {isDark ? (
        <Sun className="text-yellow-500 transition-colors group-hover:text-yellow-600 size-4.5" />
      ) : (
        <Moon className="text-gray-500 transition-colors group-hover:text-blue-600 size-4.5" />
      )}
    </button>
  );
});
export const RoomHeader = memo(
  ({
    roomName,
    activeUsers,
    roomId,
    editor,
  }: {
    roomName: string;
    activeUsers: Collaborator[];
    roomId: string;
    editor: Editor | null;
  }) => {
    return (
      <div className="absolute top-2 left-1/2 -translate-x-1/2 z-1000 flex items-center gap-3 bg-white/80 backdrop-blur-md border border-gray-200 shadow-sm rounded-full px-2 py-1.5 pointer-events-auto transition-all hover:shadow-md">
        <Link
          href="/rooms"
          className="cursor-pointer flex items-center gap-0.5 text-xs hover:underline"
        >
          <ChevronLeft className="size-3" /> Leave
        </Link>
        <div className="w-px h-5 bg-gray-300 mx-1" />
        <h1 className="font-semibold text-sm text-gray-800 tracking-tight truncate max-w-37.5">
          {roomName}
        </h1>
        <div className="w-px h-5 bg-gray-300 mx-1" />

        <div className="flex items-center gap-2 pl-1">
          <ActiveUsers users={activeUsers} />
          <InviteModal roomId={roomId} />
          <DarkModeButton editor={editor} />
        </div>
      </div>
    );
  },
);
RoomHeader.displayName = "RoomHeader";
