import mongoose, { Schema, Document, ObjectId } from 'mongoose';

export interface IArticle extends Document {
  title: string;
  content: string;
  imageUrl?: string;
  category: string;
  author: ObjectId;
  likes: ObjectId[];
  dislikes: ObjectId[];
  tags: string[];
}

const articleSchema = new Schema<IArticle>(
  {
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    imageUrl: { type: String },
    category: { type: String, required: true },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    dislikes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    tags: [{ type: String, trim: true }],
  },
  { timestamps: true }
);

export const Article = mongoose.model<IArticle>('Article', articleSchema);
