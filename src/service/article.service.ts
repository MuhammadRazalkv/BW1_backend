import mongoose from 'mongoose';
import { messages } from '../constants/httpStatusMessages';
import { HttpStatus } from '../constants/statusCodes';
import { ArticleFormData } from '../dto/article.dto';
import { Article, IArticle } from '../model/articles.model';
import { AppError } from '../utils/app.error';

export const newArticle = async (userId: string, data: Partial<IArticle>) => {
  const article = await Article.create({ ...data, author: new mongoose.Types.ObjectId(userId) });
};

export const userArticles = async (userId: string, page: number) => {
  const limit = 6;
  const skip = (page - 1) * limit;

  const userObjectId = new mongoose.Types.ObjectId(userId);

  const totalArticles = await Article.countDocuments({ author: userObjectId });

  const articles = await Article.find({ author: userObjectId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const totalPages = Math.ceil(totalArticles / limit);
  const updatedArticles = articles.map((ar) => ({
    id: ar.id,
    title: ar.title,
    content: ar.content,
    imageUrl: ar.imageUrl,
    category: ar.category,
    author: ar.author,
    likes: ar.likes.length || 0,
    dislikes: ar.dislikes.length || 0,
    blocks: ar.blocks.length || 0,
    tags: ar.tags,
    createdAt: ar.createdAt,
  }));
  return {
    articles: updatedArticles,
    totalPages,
    totalArticles,
  };
};

export const getArticleInfo = async (id: string) => {
  const article = await Article.findById(id);
  if (!article) {
    throw new AppError(HttpStatus.NOT_FOUND, messages.NOT_FOUND);
  }
  return {
    id: article.id,
    title: article.title,
    content: article.content,
    imageUrl: article.imageUrl,
    category: article.category,
    likes: article.likes.length || 0,
    dislikes: article.dislikes.length || 0,
    blocks: article.blocks.length || 0,
    tags: article.tags,
    createdAt: article.createdAt,
  };
};

export const updateArticleInfo = async (
  userId: string,
  articleId: string,
  data: ArticleFormData
) => {
  const updatedData = {
    ...data,
    author: new mongoose.Types.ObjectId(userId),
  };
  console.log('data  ',updatedData);
  
  const article = await Article.findByIdAndUpdate(articleId, { $set: updatedData }, { new: true });
  if (!article) {
    console.log('article not found');
    
    throw new AppError(HttpStatus.NOT_FOUND, messages.NOT_FOUND);
  }
};
