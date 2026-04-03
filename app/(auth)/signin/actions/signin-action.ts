"use server";

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { signInSchema } from "../schemas/signin-schema";

export async function signInAction(formData: unknown) {
  const validated = signInSchema.parse(formData);

  await auth.api.signInEmail({
    body: validated,
  });
  redirect("/");
}
