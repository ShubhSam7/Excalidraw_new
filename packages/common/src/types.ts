import { z } from "zod";

export const CreateUserSchema = z.object({
  username: z.string().min(1, "Name is required"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
  name: z.string().min(1, "Name is required"),
});

export const SigninSchema = z.object({
  username: z.string().min(1, "Name is required"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

export const CreateRoomSchema = z.object({
  name: z.string().min(1, "Name is required"),
  // description: z.string().optional(),
});
