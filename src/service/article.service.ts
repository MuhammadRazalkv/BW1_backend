import mongoose from 'mongoose';
import { messages } from '../constants/httpStatusMessages';
import { HttpStatus } from '../constants/statusCodes';
import { ArticleFormData } from '../dto/article.dto';
import { Article, IArticle } from '../model/articles.model';

export const newArticle = async (userId: string, data: Partial<IArticle>) => {
  const article = await Article.create({ ...data, author: new mongoose.Types.ObjectId(userId) });
};
