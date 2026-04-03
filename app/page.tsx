import { getCurrentUser } from "@/lib/get-current-user";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import AnimatedBackground from "@/components/AnimatedBackground";

export default async function Home() {
  const user = await getCurrentUser();
  return (
    <div className="h-[calc(100vh-65px)] bg-linear-to-t from-[#ebf8f2] to-gray-50 flex gap-3 justify-between py-6  overflow-hidden z-0 px-20 items-center">
      <div className="max-w-2xl text-left space-y-8 z-10 ">
        <div className="inline-flex items-center rounded-full border border-[#285a48] bg-white/80 backdrop-blur-sm px-4 py-1.5 text-sm text-gray-600 shadow-sm">
          <span className="flex h-2 w-2 rounded-full bg-green-600 mr-2 animate-pulse"></span>
          Real-time collaboration
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-[#091413]">
          Where ideas take{" "}
          <span className="text-transparent bg-clip-text bg-linear-to-r from-[#285a48] to-[#408a71]">
            shape.
          </span>
        </h1>

        <p className="text-xl text-[#535b5a] max-w-2xl leading-relaxed text-left">
          A blazing-fast, collaborative whiteboard for modern teams. Jump into a
          room, invite your peers, and start creating together in real-time.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 pt-8">
          <Link
            href="/rooms"
            className="w-full sm:w-auto px-8 py-4 bg-[#285a48] hover:bg-gray-800 text-white rounded-full font-medium transition-all transform hover:-translate-y-1 hover:shadow-xl flex items-center  gap-2 group"
          >
            {user ? "Join Rooms" : "Get Started"}
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
      <AnimatedBackground />
    </div>
  );
}
