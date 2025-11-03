import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
const articleRepo = new ArticleRepo();
const userRepo = new UserRepo();
const articleService = new ArticleService(articleRepo, userRepo);
const articleController = new ArticleController(articleService);
import uploadMiddleware from '../utils/multer';
import { ArticleRepo } from '../repository/article.repo';
import ArticleService from '../service/article.service';
import { UserRepo } from '../repository/user.repo';
import ArticleController from '../controller/article.controller';
const upload = uploadMiddleware('article-Images');
const articleRoute = Router();
articleRoute
  .post('/article', authMiddleware, upload.single('image'), articleController.createArticle)
  .get('/articles', authMiddleware, articleController.getUserArticles)
  .get('/article/:id', authMiddleware, articleController.getArticle)
  .put('/article', authMiddleware, upload.single('image'), articleController.updateArticle)
  .get('/article-list', authMiddleware, articleController.articleList)
  .patch('/reaction', authMiddleware, articleController.toggleReaction)
  .patch('/block', authMiddleware, articleController.blockArticle)
  .delete('/delete', authMiddleware, articleController.deleteArticle);

export default articleRoute;
