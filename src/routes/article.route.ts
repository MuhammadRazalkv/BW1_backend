import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import { createArticle } from '../controller/article.controller';
import uploadMiddleware from '../utils/multer';
const upload = uploadMiddleware('article-Images');
const articleRoute = Router();
articleRoute.post('/article', authMiddleware, upload.single('image'), createArticle);

export default articleRoute;
