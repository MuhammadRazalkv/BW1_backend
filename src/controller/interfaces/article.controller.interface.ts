import { NextFunction, Response } from 'express';
import { ExtendedRequest } from '../../middlewares/auth.middleware';

export interface IArticleController {
  createArticle: (req: ExtendedRequest, res: Response, next: NextFunction) => Promise<void>;
  getUserArticles: (req: ExtendedRequest, res: Response, next: NextFunction) => Promise<void>;
  getArticle: (req: ExtendedRequest, res: Response, next: NextFunction) => Promise<void>;
  updateArticle: (req: ExtendedRequest, res: Response, next: NextFunction) => Promise<void>;
  articleList: (req: ExtendedRequest, res: Response, next: NextFunction) => Promise<void>;
  toggleReaction: (req: ExtendedRequest, res: Response, next: NextFunction) => Promise<void>;
  blockArticle: (req: ExtendedRequest, res: Response, next: NextFunction) => Promise<void>;
  deleteArticle: (req: ExtendedRequest, res: Response, next: NextFunction) => Promise<void>;
}
