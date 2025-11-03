import mongoose from 'mongoose';
import { ArticleFormData } from '../../dto/article.dto';
import { IArticle } from '../../model/articles.model';
import { IUser } from '../../model/user.model';

export interface IArticleService {
  newArticle: (userId: string, data: ArticleFormData) => Promise<void>;
  userArticles: (
    userId: string,
    page: number
  ) => Promise<{
    articles: {
      id: string;
      title: string;
      imageUrl: string | undefined;
      category: string;
      likes: number;
      dislikes: number;
      blocks: number;
      tags: string[];
      createdAt: Date | undefined;
    }[];
    totalPages: number;
    totalArticles: number;
  }>;
  getArticleInfo: (
    userId: string,
    articleId: string
  ) => Promise<{
    id: string;
    title: string;
    content: string;
    imageUrl: string | undefined;
    category: string;
    likes: number;
    dislikes: number;
    blocks: number;
    tags: string[];
    author: Pick<IUser, '_id' | 'firstName' | 'profilePic'>;
    createdAt: Date | undefined;
    userReaction: string | null;
  }>;

  updateArticleInfo: (
    userId: string,
    articleId: string,
    data: {
      title: string;
      content: string;
      category: string;
      tags: string[];
      imageUrl?: string | undefined;
    }
  ) => Promise<void>;

  getArticleList: (
    userId: string,
    page: number
  ) => Promise<{
    articles: {
      id: string;
      title: string;
      imageUrl: string | undefined;
      category: string;
      likes: number;
      dislikes: number;
      tags: string[];
      createdAt: Date | undefined;
    }[];
    hasMore: boolean;
  }>;

  changeReaction: (
    userId: string,
    articleId: string,
    reaction: 'like' | 'dislike'
  ) => Promise<{
    likes: number;
    dislikes: number;
    userReaction: string | null;
  }>;
  bArticle: (userId: string, articleId: string) => Promise<void>;
  deleteArticleInfo: (userId: string, articleId: string) => Promise<IArticle>;
}
