import { z } from 'zod';
export const passwordSchema = z.object({
  currentPassword: z.string().min(6, 'Password must be at least 6 characters'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
});
export type PasswordSchema = z.infer<typeof passwordSchema>;
