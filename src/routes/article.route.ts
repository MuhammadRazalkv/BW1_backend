import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import uploadMiddleware from '../utils/multer';
import { ArticleRepo } from '../repository/article.repo';
import ArticleService from '../service/article.service';
import { UserRepo } from '../repository/user.repo';
import ArticleController from '../controller/article.controller';
import { validateQuery } from '../middlewares/validate.query.middleware';
import { idSchema } from '../dto/req.dto';

const articleRepo = new ArticleRepo();
const userRepo = new UserRepo();
const articleService = new ArticleService(articleRepo, userRepo);
const articleController = new ArticleController(articleService);
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
  .delete('/delete', authMiddleware, articleController.deleteArticle)
  .get('/blocked', authMiddleware, articleController.blockedArticles)
  .patch('/unblock',authMiddleware, validateQuery(idSchema), articleController.unblockArticle)

export default articleRoute;
