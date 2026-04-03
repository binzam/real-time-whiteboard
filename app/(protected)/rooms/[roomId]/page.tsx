import { getCurrentUser } from "@/lib/get-current-user";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import RoomClient from "./components/RoomClient";

export default async function DynamicRoomPage({
  params,
}: {
  params: Promise<{ roomId: string }>;
}) {
  const { roomId } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/signin");

  const membership = await prisma.roomMember.findUnique({
    where: { roomId_userId: { roomId, userId: user.id } },
    include: { room: true },
  });

  if (!membership) {
    return (
      <div className="flex h-screen items-center justify-center">
        <h1>You do not have access to this room.</h1>
      </div>
    );
  }

  const colors = ["#FF5733", "#33FF57", "#3357FF", "#FF33F5", "#F5FF33"];
  const userColor = colors[user.id.charCodeAt(0) % colors.length];

  return (
    <RoomClient
      roomId={roomId}
      roomName={membership.room.name}
      user={{ id: user.id, name: user.name, color: userColor }}
    />
  );
}
