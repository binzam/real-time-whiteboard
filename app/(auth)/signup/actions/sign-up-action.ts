"use server";

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { signUpSchema } from "../schemas/signup-schema";

export async function signUpAction(formData: unknown) {
  const validated = signUpSchema.parse(formData);
  console.log({ validated });
  await auth.api.signUpEmail({
    body: {
      email: validated.email,
      password: validated.password,
      name: validated.name,
    },
  });
  redirect("/");
}
