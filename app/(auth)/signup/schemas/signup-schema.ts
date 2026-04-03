import { z } from "zod";

export const signUpSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50),

  email: z.email("Invalid email address"),

  password: z.string().min(6, "Password must be at least 6 characters"),
  // .regex(/[A-Z]/, "Must include one uppercase letter")
  // .regex(/[0-9]/, "Must include one number"),

});

export type SignUpInput = z.infer<typeof signUpSchema>;
