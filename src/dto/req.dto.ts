import { z } from 'zod';
import { messages } from '../constants/httpStatusMessages';

export const fieldSchemas = {
  firstName: z
    .string()
    .trim()
    .regex(/^[A-Za-z]{3,16}$/, 'First name can only contain letters')
    .min(3, 'First name must be at least 3 characters')
    .max(16, 'First name cannot exceed 16 characters'),

  lastName: z
    .string()
    .trim()
    .regex(/^[A-Za-z ]{1,10}$/, 'Last name can only contain letters and spaces')
    .min(1, 'Last name must be at least 1 character')
    .max(10, 'Last name cannot exceed 10 characters'),

  email: z.email('Invalid email'),

  phone: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/, 'Invalid  phone number'),

  dob: z.string().refine((date) => {
    if (!date) return false;

    const [year, month, day] = date.split('-').map(Number);
    const dobDate = new Date(year, month - 1, day);
    const today = new Date();

    // Calculate age
    let age = today.getFullYear() - dobDate.getFullYear();
    const monthDiff = today.getMonth() - dobDate.getMonth();
    const dayDiff = today.getDate() - dobDate.getDate();

    // Adjust if the birthday hasn't occurred yet this year
    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
      age--;
    }

    return age >= 13 && dobDate <= today;
  }, 'You must be at least 13 years old'),
};
const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export const signupSchema = z.object({
  ...fieldSchemas,
  preferences: z.array(z.string()).min(1, 'Add minimum of 1 preferences'),
  password: z
    .string()
    .regex(
      strongPasswordRegex,
      'Password must be 8+ chars and include uppercase, lowercase, number & special character'
    ),
});

export type UpdateSchema = z.infer<typeof fieldSchemas>;
export type SignupFormData = z.infer<typeof signupSchema>;

export const tokenSchema = z.object({
  token: z.string().regex(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/, 'Invalid JWT format'),
});
export type TokenDTO = z.infer<typeof tokenSchema>;

export const emailSchema = z.object({
  email: z.email('Invalid email'),
});
export type EmailDTO = z.infer<typeof emailSchema>;

export const loginSchema = z
  .object({
    email: z.email('Invalid email').optional(),
    phone: z
      .string()
      .trim()
      .regex(/^[6-9]\d{9}$/, 'Invalid  phone number')
      .optional(),
    password: z.string().min(6, 'Invalid password'),
  })
  .refine((data) => !!data.email || !!data.phone, {
    error: 'Please provide either email or phone',
    path: ['email'],
  });

export type LoginDTO = z.infer<typeof loginSchema>;

export const idSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, messages.INVALID_ID),
});
export type IdDTO = z.infer<typeof idSchema>;