import { z } from 'zod';

export const articleSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
  category: z.string().min(1, 'Category is required'),
  tags: z.array(z.string()).min(1, 'Add at least one tag'),
  image: z
    .instanceof(File)
    .refine((file) => ['image/jpeg', 'image/png', 'image/webp'].includes(file.type), {
      message: 'Only JPG, PNG, or WEBP images are allowed',
    })
    .refine((file) => file.size <= 2 * 1024 * 1024, {
      message: 'Image size must be less than 2MB',
    })
    .optional(),
});

export type ArticleFormData = z.infer<typeof articleSchema>;
