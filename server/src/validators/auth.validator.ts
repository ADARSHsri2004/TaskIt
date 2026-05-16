import { z } from "zod";

export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2)
    .optional(),

  email: z
    .string()
    .trim()
    .email(),

  password: z
    .string()
    .min(6),

  role: z
    .enum(["ADMIN", "USER"])
    .optional()
});

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .email(),

  password: z
    .string()
    .min(6)
});
