"use client";

import { useState } from "react";
import {
  getInvitableUsers,
  inviteUserToRoom,
} from "@/app/(protected)/rooms/actions/room-actions";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Loader2, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface User {
  id: string;
  name: string;
}
export default function InviteModal({ roomId }: { roomId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [invitingId, setInvitingId] = useState<string | null>(null);

  const handleOpenChange = async (open: boolean) => {
    setIsOpen(open);
    if (open) {
      setIsLoading(true);
      try {
        const availableUsers = await getInvitableUsers(roomId);
        setUsers(availableUsers);
      } finally {
        setIsLoading(false);
      }
    }
  };
  const handleInvite = async (userId: string) => {
    setInvitingId(userId);
    try {
      await inviteUserToRoom(roomId, userId);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
    } finally {
      setInvitingId(null);
    }
  };
  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="secondary"
          size="sm"
          className="rounded-full h-8 gap-1.5 text-xs font-semibold"
        >
          <UserPlus className="size-3.5" />
          Share
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold tracking-tight">
            Invite Collaborators
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-10 gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Finding users...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-sm text-muted-foreground">
                No users available to invite.
              </p>
            </div>
          ) : (
            <ScrollArea className="h-60 pr-4">
              <div className="space-y-3">
                {users.map((u) => (
                  <div
                    key={u.id}
                    className="flex items-center justify-between p-3 border rounded-xl bg-card hover:bg-accent/50 transition-colors"
                  >
                    <span className="text-sm font-medium">{u.name}</span>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 rounded-lg"
                      disabled={invitingId === u.id}
                      onClick={() => handleInvite(u.id)}
                    >
                      {invitingId === u.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        "Invite"
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
