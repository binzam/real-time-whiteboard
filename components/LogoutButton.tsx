"use client";

import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  return (
    <Button
      className="w-full mt-4"
      onClick={async () => {
        await signOut();
        router.refresh();
      }}
    >
      Logout
    </Button>
  );
}
