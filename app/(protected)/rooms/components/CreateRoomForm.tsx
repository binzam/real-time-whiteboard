"use client";

import { useState } from "react";
import { createRoom } from "@/app/(protected)/rooms/actions/room-actions";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function CreateRoomForm() {
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsLoading(true);
    try {
      const room = await createRoom(name);
      router.push(`/rooms/${room.id}`);
    } catch (error) {
      console.error(error);
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Room Name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border border-[#b0e4cc] rounded-md p-2 text-[#091413] focus:ring-2 focus:ring-[#285a48] focus:outline-none"
          placeholder="e.g. Q4 Brainstorming"
          required
        />
      </div>
      <Button
        type="submit"
        size={"lg"}
        disabled={isLoading || !name.trim()}
        className="w-full bg-[#285a48] text-white rounded-md py-2 font-medium hover:bg-[#091413] disabled:opacity-50 transition-colors"
      >
        {isLoading ? "Creating..." : "Create Room"}
      </Button>
    </form>
  );
}
