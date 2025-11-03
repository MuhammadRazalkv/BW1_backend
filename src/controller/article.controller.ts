import { NextFunction, Request, Response } from 'express';
import { validate } from '../utils/validate.zod';
import { articleSchema } from '../dto/article.dto';
import { ExtendedRequest } from '../middlewares/auth.middleware';
import { messages } from '../constants/httpStatusMessages';
import { HttpStatus } from '../constants/statusCodes';
import { AppError } from '../utils/app.error';
import { sendSuccess } from '../utils/response.util';
import { IArticleController } from './interfaces/article.controller.interface';
import { IArticleService } from '../service/interfaces/article.service.interface';

export default class ArticleController implements IArticleController {
  constructor(private _articleService: IArticleService) {}

  createArticle = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
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

      const data = validate(articleSchema, articleData);

      await this._articleService.newArticle(userId, data);

      sendSuccess(res, HttpStatus.CREATED, {}, messages.CREATED);
    } catch (error) {
      next(error);
    }
  };

  getUserArticles = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.id;
      if (!userId) {
        throw new AppError(HttpStatus.BAD_REQUEST, messages.TOKEN_NOTFOUND);
      }
      const page = Number(req.query.page) || 1;
      const { articles, totalArticles, totalPages } = await this._articleService.userArticles(
        userId,
        page
      );
      console.log(articles, totalArticles, totalPages);

      sendSuccess(res, HttpStatus.OK, { articles, totalPages, totalArticles });
    } catch (error) {
      next(error);
    }
  };

  getArticle = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.id;
      if (!userId) {
        throw new AppError(HttpStatus.BAD_REQUEST, messages.TOKEN_NOTFOUND);
      }
      const articleId = req.params.id as string;

      const article = await this._articleService.getArticleInfo(userId, articleId);

      sendSuccess(res, HttpStatus.OK, { article });
    } catch (error) {
      next(error);
    }
  };

  updateArticle = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.id;
      if (!userId) throw new AppError(HttpStatus.BAD_REQUEST, messages.TOKEN_NOTFOUND);
      let tags: string[] = [];
      if (req.body.tags) {
        if (Array.isArray(req.body.tags)) tags = req.body.tags;
        else if (typeof req.body.tags === 'string') tags = [req.body.tags];
      }
      const articleId = req.body.articleId;
      const articleData = {
        title: req.body.title,
        content: req.body.content,
        category: req.body.category,
        tags,
        imageUrl: req.file?.path ?? undefined,
      };
      console.log('image', req.file?.path);

      const data = validate(articleSchema, articleData);

      await this._articleService.updateArticleInfo(userId, articleId, data);

      sendSuccess(res, HttpStatus.OK, {}, messages.UPDATED);
    } catch (error) {
      next(error);
    }
  };

  articleList = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.id;
      if (!userId) {
        throw new AppError(HttpStatus.BAD_REQUEST, messages.TOKEN_NOTFOUND);
      }
      const page = Number(req.query.page) || 1;
      const { articles, hasMore } = await this._articleService.getArticleList(userId, page);

      sendSuccess(res, HttpStatus.OK, { articles, hasMore });
    } catch (error) {
      next(error);
    }
  };

  toggleReaction = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.id;
      if (!userId) {
        throw new AppError(HttpStatus.BAD_REQUEST, messages.TOKEN_NOTFOUND);
      }
      const { articleId, reaction } = req.body;
      const { dislikes, likes, userReaction } = await this._articleService.changeReaction(
        userId,
        articleId,
        reaction
      );

      sendSuccess(res, HttpStatus.OK, { likes, dislikes, userReaction }, messages.UPDATED);
    } catch (error) {
      next(error);
    }
  };

  blockArticle = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.id;
      if (!userId) {
        throw new AppError(HttpStatus.BAD_REQUEST, messages.TOKEN_NOTFOUND);
      }
      const { articleId } = req.body;
      await this._articleService.bArticle(userId, articleId);
      sendSuccess(res, HttpStatus.OK, {}, messages.UPDATED);
    } catch (error) {
      next(error);
    }
  };

  deleteArticle = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.id;
      if (!userId) {
        throw new AppError(HttpStatus.BAD_REQUEST, messages.TOKEN_NOTFOUND);
      }
      const { articleId } = req.query;
      await this._articleService.deleteArticleInfo(userId, articleId as string);
      sendSuccess(res, HttpStatus.OK, {}, messages.DELETED);
    } catch (error) {
      next(error);
    }
  };
}
