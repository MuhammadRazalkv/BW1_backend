import { NextFunction, Request, Response } from 'express';
import { validate } from '../utils/validate.zod';
import { articleSchema } from '../dto/article.dto';
import { ExtendedRequest } from '../middlewares/auth.middleware';
import { messages } from '../constants/httpStatusMessages';
import { HttpStatus } from '../constants/statusCodes';
import { AppError } from '../utils/app.error';
import {
  getArticleInfo,
  newArticle,
  updateArticleInfo,
  userArticles,
} from '../service/article.service';
import { sendSuccess } from '../utils/response.util';

export const createArticle = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.id;
    if (!userId) throw new AppError(HttpStatus.BAD_REQUEST, messages.TOKEN_NOTFOUND);

    let tags: string[] = [];
    if (req.body.tags) {
      if (Array.isArray(req.body.tags)) tags = req.body.tags;
      else if (typeof req.body.tags === 'string') tags = [req.body.tags];
    }

    const articleData = {
      title: req.body.title,
      content: req.body.content,
      category: req.body.category,
      tags,
      imageUrl: req.file?.path ?? undefined,
    };
    console.log('image', req.file?.path);

    const data = validate(articleSchema, articleData);

    await newArticle(userId, data);

    sendSuccess(res, HttpStatus.CREATED, {}, messages.CREATED);
  } catch (error) {
    next(error);
  }
};

export const getUserArticles = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.id;
    if (!userId) {
      throw new AppError(HttpStatus.BAD_REQUEST, messages.TOKEN_NOTFOUND);
    }
    const page = Number(req.query.page) || 1;
    const { articles, totalArticles, totalPages } = await userArticles(userId, page);

    sendSuccess(res, HttpStatus.CREATED, { articles, totalPages, totalArticles }, messages.CREATED);
  } catch (error) {
    next(error);
  }
};
export const getArticle = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.id;
    if (!userId) {
      throw new AppError(HttpStatus.BAD_REQUEST, messages.TOKEN_NOTFOUND);
    }
    const articleId = req.params.id as string;

    const article = await getArticleInfo(articleId);

    sendSuccess(res, HttpStatus.OK, { article });
  } catch (error) {
    next(error);
  }
};

export const updateArticle = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.id;
    if (!userId) throw new AppError(HttpStatus.BAD_REQUEST, messages.TOKEN_NOTFOUND);
    let tags: string[] = [];
    if (req.body.tags) {
      if (Array.isArray(req.body.tags)) tags = req.body.tags;
      else if (typeof req.body.tags === 'string') tags = [req.body.tags];
    }
    const articleId = req.body.articleId
    const articleData = {
      title: req.body.title,
      content: req.body.content,
      category: req.body.category,
      tags,
      imageUrl: req.file?.path ?? undefined,
    };
    console.log('image', req.file?.path);

    const data = validate(articleSchema, articleData);

    await updateArticleInfo(userId,articleId, data);

    sendSuccess(res, HttpStatus.OK, {}, messages.UPDATED);
  } catch (error) {
    next(error);
  }
};
