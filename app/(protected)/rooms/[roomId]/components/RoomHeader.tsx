"use client";

import { Collaborator } from "@/hooks/useYjsStore";
import "tldraw/tldraw.css";
import InviteModal from "./InviteModal";
import { Editor, track } from "tldraw";
import ActiveUsers from "./ActiveUsers";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Link from "next/link";
import { memo } from "react";
import { Moon, Sun } from "lucide-react";

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
    user,
    activeUsers,
    roomId,
    editor,
  }: {
    roomName: string;
    user: { id: string; name: string; color: string };
    activeUsers: Collaborator[];
    roomId: string;
    editor: Editor | null;
  }) => {
    return (
      <div className="absolute top-2 left-1/2 -translate-x-1/2 z-[1000] flex items-center gap-3 bg-white/80 backdrop-blur-md border border-gray-200 shadow-sm rounded-full px-2 py-1.5 pointer-events-auto transition-all hover:shadow-md">
        <DropdownMenu>
          <DropdownMenuTrigger className="outline-none">
            <Avatar className="h-8 w-8 hover:opacity-80 transition-opacity cursor-pointer">
              <AvatarFallback className="bg-black text-white text-xs">
                {user.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className="w-48 rounded-xl ml-2 z-[1001]"
          >
            <DropdownMenuItem asChild>
              <Link href="/rooms" className="cursor-pointer ">
                ← Back to Rooms
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="w-px h-5 bg-gray-300 mx-1" />
        <h1 className="font-semibold text-sm text-gray-800 tracking-tight truncate max-w-[150px]">
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
