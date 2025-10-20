import { z } from 'zod';

export const fieldSchemas = {
  firstName: z
    .string()
    .min(2, 'First name must be at least 2 characters')
    .max(20, 'First name cannot exceed 20 characters'),

  lastName: z
    .string()
    .min(1, 'Last name must be at least 2 characters')
    .max(20, 'Last name cannot exceed 20 characters'),

  email: z.email('Invalid email'),

  phone: z.string().length(10, 'Invalid phone number'),

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

export const signupSchema = z.object({
  ...fieldSchemas,
  password: z.string().min(6, 'Password must be at least 6 characters'),
  preferences: z.array(z.string()).min(1, 'Add minimum of 1 preferences'),
});

export type UpdateSchema = z.infer<typeof fieldSchemas>;
export type SignupFormData = z.infer<typeof signupSchema>;
