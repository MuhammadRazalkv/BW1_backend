import { z } from 'zod';

export const signupSchema = z
  .object({
    firstName: z.string().min(2, 'First name must be at least 2 characters').max(20,'First name cannot exceed 20 characters'),
    lastName: z.string().min(1,'Last name must be at least 2 characters').max(20,'Last name cannot exceed 20 characters'),
    email: z.email('Invalid email'),
    phone: z.string().length(10, 'Invalid phone number'),
    dob: z.string().refine((date: string) => {
      const dobDate = new Date(date);
      const today = new Date();
      const age = today.getFullYear() - dobDate.getFullYear();
      return age >= 13 && dobDate <= today;
    }, 'You must be at least 13 years old'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(6, 'Confirm your password'),
    preferences: z.array(z.string()).min(1, 'Add minimum of 1 preferences'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export type SignupSchema = z.infer<typeof signupSchema>;
