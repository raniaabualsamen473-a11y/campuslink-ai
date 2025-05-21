
import { z } from "zod";

export const authSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  firstName: z.string().min(1, { message: "First name is required" }).optional(),
  secondName: z.string().min(1, { message: "Second name is required" }).optional(),
  thirdName: z.string().min(1, { message: "Third name is required" }).optional(),
  lastName: z.string().min(1, { message: "Last name is required" }).optional(),
  fullName: z.string().min(6, { message: "Please enter your full name as shown on your university ID" }),
  universityId: z.string()
    .regex(/^\d{7}$/, { message: "University ID must be exactly 7 digits" }),
  universityEmail: z.string()
    .regex(/^[a-z]{3}\d{7}@ju\.edu\.jo$/, { 
      message: "University email must follow the format: abc1234567@ju.edu.jo" 
    }),
  telegramUsername: z.string()
    .refine(val => !val || !/^@/.test(val), {
      message: "Please enter the username without the @ symbol"
    })
    .refine(val => !val || /^[a-zA-Z0-9_]+$/.test(val), {
      message: "Username can only contain letters, numbers, and underscores"
    })
    .optional()
    .or(z.literal('')),
});

export const profileCompletionSchema = z.object({
  fullName: z.string().min(6, { message: "Please enter your full name as shown on your university ID" }),
  universityId: z.string()
    .regex(/^\d{7}$/, { message: "University ID must be exactly 7 digits" }),
  telegramUsername: z.string()
    .refine(val => !val || !/^@/.test(val), {
      message: "Please enter the username without the @ symbol"
    })
    .refine(val => !val || /^[a-zA-Z0-9_]+$/.test(val), {
      message: "Username can only contain letters, numbers, and underscores"
    })
    .optional()
    .or(z.literal('')),
});

export type AuthFormValues = z.infer<typeof authSchema>;
export type ProfileCompletionValues = z.infer<typeof profileCompletionSchema>;
