import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import {
  articleList,
  blockArticle,
  createArticle,
  deleteArticle,
  getArticle,
  getUserArticles,
  toggleReaction,
  updateArticle,
} from '../controller/article.controller';
import uploadMiddleware from '../utils/multer';
const upload = uploadMiddleware('article-Images');
const articleRoute = Router();
articleRoute
  .post('/article', authMiddleware, upload.single('image'), createArticle)
  .get('/articles', authMiddleware, getUserArticles)
  .get('/article/:id', authMiddleware, getArticle)
  .put('/article', authMiddleware, upload.single('image'), updateArticle)
  .get('/article-list', authMiddleware, articleList)
  .patch('/reaction', authMiddleware, toggleReaction)
  .patch('/block', authMiddleware, blockArticle)
  .delete('/delete', authMiddleware, deleteArticle);

export default articleRoute;
