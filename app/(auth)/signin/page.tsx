import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import SignInForm from "./components/SignInForm";

const SignInPage = () => {
  return (
    <div className="min-h-[calc(100vh-65px)] grid lg:grid-cols-2">
      <div className="hidden lg:flex flex-col justify-evenly bg-gray-800 text-white p-12">
        <div>
          <h1 className="text-3xl font-bold">Archietect</h1>
        </div>

        <div className="space-y-6 max-w-md">
          <h2 className="text-4xl font-bold leading-tight">Welcome back.</h2>
        </div>
      </div>

      <div className="flex items-center justify-center p-6">
        <Card className="w-full max-w-md shadow-xl rounded-2xl border-none">
          <CardContent className="p-8 space-y-6">
            <div className="space-y-2 text-center">
              <h2 className="text-2xl font-bold">Sign in</h2>
              <p className="text-sm text-muted-foreground">
                Enter your credentials to continue
              </p>
            </div>

            <SignInForm />

            <p className="text-sm text-center text-muted-foreground">
              Dont have an account?{" "}
              <Link href="/signup" className="text-primary hover:underline">
                Create one
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
export default SignInPage;
