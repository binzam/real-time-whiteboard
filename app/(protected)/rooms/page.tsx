import { getUserRooms } from "@/app/(protected)/rooms/actions/room-actions";
import { getCurrentUser } from "@/lib/get-current-user";
import { redirect } from "next/navigation";
import Link from "next/link";
import CreateRoomForm from "./components/CreateRoomForm";
import { ChevronRight, Plus } from "lucide-react";

export default async function RoomsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/signin");

  const rooms = await getUserRooms();
  console.log({ rooms });
  return (
    <div className="min-h-[calc(100vh-65px)] bg-[#FAFAFA] pb-12 pt-8 text-slate-900">
      <div className="container mx-auto  px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col gap-2">
          <h1 className="text-3xl font-semibold tracking-tight text-[#091413]">
            Welcome back, {user.name.split(" ")[0]}
          </h1>
          <p className="text-[#091413] text-sm sm:text-base max-w-2xl">
            Select an existing workspace or create a new room to start
            collaborating with your team.
          </p>
        </div>

        <div className="flex flex-col items-start gap-8 lg:flex-row">
          <div className="w-full lg:w-[400px] sticky top-8 z-10">
            <div className="bg-white p-6 rounded-2xl shadow-sm ring-1 ring-slate-200/60 overflow-hidden relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-[#285a48] to-[#b0e4cc]" />

              <h2 className="text-lg font-semibold mb-1 flex items-center gap-2 text-[#091413]">
                <Plus className="size-5 text-[#285a48]" />
                Create a Room
              </h2>
              <p className="text-sm text-[#285a48] mb-6">
                Set up a new space for your next big project.
              </p>
              <CreateRoomForm />
            </div>
          </div>

          <div className="flex-1">
            <h2 className="text-lg font-semibold mb-4 text-[#091413] flex items-center gap-2">
              <svg
                className="w-5 h-5 text-[285a48]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
              Your Rooms
            </h2>

            {rooms.length === 0 ? (
              <div className="bg-white flex flex-col items-center justify-center p-12 rounded-2xl ring-1 ring-slate-200/60 border border-dashed border-slate-300 text-center">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                  <svg
                    className="w-8 h-8 text-slate-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M17 14v6m-3-3h6M6 10h2a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2zm10 0h2a2 2 0 002-2V6a2 2 0 00-2-2h-2a2 2 0 00-2 2v2a2 2 0 002 2zM6 20h2a2 2 0 002-2v-2a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-sm font-semibold text-slate-900">
                  No rooms yet
                </h3>
                <p className="mt-1 text-sm text-slate-500 max-w-sm">
                  Get started by creating a new room using the form on the left.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {rooms.map((room) => (
                  <Link
                    key={room.id}
                    href={`/rooms/${room.id}`}
                    className="group relative flex flex-col justify-between p-6 bg-white rounded-sm shadow-sm ring-1 ring-slate-200/60 hover:ring-[#285a48]  hover:shadow-md transition-all duration-300 hover:-translate-y-1"
                  >
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="font-semibold text-lg text-[#091413]  transition-colors line-clamp-1">
                          {room.name}
                        </h3>
                        <ChevronRight className="shrink-0 w-5 h-5 text-[#285a48] transition-all duration-300 transform translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100" />
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-50/50">
                      <div className="flex items-center text-sm font-medium text-[#408a71]">
                        {room.members.length}{" "}
                        {room.members.length === 1 ? "member" : "members"}
                      </div>

                      <div className="flex -space-x-2 overflow-hidden">
                        {room.members.slice(0, 3).map((member, i) => (
                          <div
                            key={member.id}
                            className={` h-8 w-8 rounded-full border-2 border-white flex items-center justify-center text-xs font-semibold text-white ring-2 ring-white
                              ${
                                i === 0
                                  ? "bg-linear-to-br from-indigo-400 to-purple-500"
                                  : i === 1
                                    ? "bg-linear-to-br from-blue-400 to-cyan-500"
                                    : "bg-linear-to-br from-emerald-400 to-teal-500"
                              }`}
                            title={member.user.name}
                          >
                            {member.user.name.charAt(0).toUpperCase()}
                          </div>
                        ))}
                        {room.members.length > 3 && (
                          <div className="h-8 w-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-xs font-semibold text-slate-600 ring-2 ring-white">
                            +{room.members.length - 3}
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
