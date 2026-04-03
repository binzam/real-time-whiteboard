import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import SignUpForm from "./components/SignUpForm";

export default function SignUpPage() {
  return (
    <div className="min-h-[calc(100vh-65px)] grid lg:grid-cols-2">
      <div className="hidden lg:flex flex-col justify-evenly bg-gray-950 text-white p-12">
        <div>
          <h1 className="text-3xl font-bold">Architect</h1>
        </div>

        <div className="space-y-6 max-w-md">
          <h2 className="text-4xl font-bold leading-tight">
          </h2>
          <p className="text-white/80 text-lg"></p>
        </div>
      </div>

      <div className="flex items-center justify-center p-6">
        <Card className="w-full max-w-md shadow-xl rounded-2xl border-none">
          <CardContent className="p-8 space-y-6">
            <div className="space-y-2 text-center">
              <h2 className="text-2xl font-bold">Create account</h2>
              <p className="text-sm text-muted-foreground">
              </p>
            </div>

            <SignUpForm />

            <div className="my-6 flex items-center gap-3">
              <Separator className="flex-1" />
              <span className="text-xs text-muted-foreground">OR</span>
              <Separator className="flex-1" />
            </div>

            <p className="text-sm text-center text-muted-foreground">
              Already have an account?{" "}
              <Link href="/signin" className="text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
