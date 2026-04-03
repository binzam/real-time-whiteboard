"use client";

import { usePathname } from "next/navigation";

export function HeaderVisibility({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Hide the global header completely when inside a whiteboard room
  if (pathname?.startsWith("/rooms/")) {
    return null; 
  }

  return <>{children}</>;
}