"use server";

import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/get-current-user";
import { revalidatePath } from "next/cache";

export async function createRoom(name: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const room = await prisma.room.create({
    data: {
      name,
      members: {
        create: {
          userId: user.id,
        },
      },
    },
  });

  revalidatePath("/dashboard");
  return room;
}

export async function getUserRooms() {
  const user = await getCurrentUser();
  if (!user) return [];

  return prisma.room.findMany({
    where: { members: { some: { userId: user.id } } },
    include: { members: { include: { user: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function getInvitableUsers(roomId: string) {
  const user = await getCurrentUser();
  if (!user) return [];

  return prisma.user.findMany({
    where: {
      id: { not: user.id },
      roomMembers: { none: { roomId } },
    },
    select: { id: true, name: true, email: true, image: true },
  });
}

export async function inviteUserToRoom(roomId: string, userId: string) {
  const currentUser = await getCurrentUser();
  if (!currentUser) throw new Error("Unauthorized");

  await prisma.roomMember.create({
    data: { roomId, userId },
  });

  revalidatePath(`/rooms/${roomId}`);
  return { success: true };
}
