import { z } from 'zod';

export const articleSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
  category: z.string().min(1, 'Category is required'),
  tags: z.array(z.string()).min(1, 'Add at least one tag'),
  imageUrl: z.string().optional(),
});

export type ArticleFormData = z.infer<typeof articleSchema>;
