import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import LogoutButton from "./LogoutButton";
import { getCurrentUser } from "@/lib/get-current-user";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

function getInitials(name?: string | null, email?: string | null) {
  if (name) {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }
  if (email) return email[0].toUpperCase();
  return "U";
}
export async function Header() {
  const user = await getCurrentUser();

  return (
    <header className="sticky top-0 z-50 w-full border-b  bg-white backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-6">
        <Link href="/" className="text-3xl font-semibold tracking-tight">
          ARCHETICT
        </Link>

        {user ? (
          <div className="flex items-center gap-6">
            <Link
              href="/rooms"
              className="text-xl font-semibold tracking-tight"
            >
              Rooms
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size={"icon-lg"} variant={"ghost"}>
                  <Avatar className="h-9 w-9">
                    <AvatarFallback>
                      {getInitials(user.name, user.email)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-56 rounded-xl">
                <DropdownMenuLabel className="flex flex-col space-y-1">
                  <span className="text-sm font-medium">
                    {user.name || "User"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {user.email}
                  </span>
                </DropdownMenuLabel>

                <DropdownMenuSeparator />

                <DropdownMenuItem asChild>
                  <LogoutButton />
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Button asChild variant="ghost">
              <Link href="/signin">Sign in</Link>
            </Button>
            <Button asChild>
              <Link href="/signup">Get Started</Link>
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
