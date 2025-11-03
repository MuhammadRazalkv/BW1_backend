import mongoose from 'mongoose';
import { messages } from '../constants/httpStatusMessages';
import { HttpStatus } from '../constants/statusCodes';
import { ArticleFormData } from '../dto/article.dto';

import { AppError } from '../utils/app.error';
import { IArticleService } from './interfaces/article.service.interface';
import { IArticleRepo } from '../repository/interface/article.repo.interface';
import { IUserRepo } from '../repository/interface/user.repo.interface';

export default class ArticleService implements IArticleService {
  constructor(
    private _articleRepo: IArticleRepo,
    private _userRepo: IUserRepo
  ) {}

  newArticle = async (userId: string, data: ArticleFormData) => {
    const article = await this._articleRepo.create({
      ...data,
      author: new mongoose.Types.ObjectId(userId),
    });
  };

  userArticles = async (userId: string, page: number) => {
    const limit = 6;
    const skip = (page - 1) * limit;

    const userObjectId = new mongoose.Types.ObjectId(userId);

    const totalArticles = await this._articleRepo.countDocuments({ author: userObjectId });

    const articles = await this._articleRepo.findAll(
      { author: userObjectId },
      { sort: { createdAt: -1 }, skip, limit }
    );

    const totalPages = Math.ceil(totalArticles / limit);
    const updatedArticles = articles.map((ar) => ({
      id: String(ar._id),
      title: ar.title,
      imageUrl: ar.imageUrl,
      category: ar.category,
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

  getArticleInfo = async (userId: string, articleId: string) => {
    const user = await this._userRepo.findById(userId);
    if (!user) {
      throw new AppError(HttpStatus.NOT_FOUND, messages.NOT_FOUND);
    }
    const article = await this._articleRepo.populatedArticleInfo(articleId);
    if (!article) {
      throw new AppError(HttpStatus.NOT_FOUND, messages.NOT_FOUND);
    }
    if (user.blockedArticles.includes(new mongoose.Types.ObjectId(articleId))) {
      throw new AppError(HttpStatus.FORBIDDEN, messages.FORBIDDEN);
    }
    const userObjId = new mongoose.Types.ObjectId(userId);
    const hasLiked = article.likes.includes(userObjId);
    const hasDisLiked = article.dislikes.includes(userObjId);

    return {
      id: String(article._id),
      title: article.title,
      content: article.content,
      imageUrl: article.imageUrl,
      category: article.category,
      likes: article.likes.length || 0,
      dislikes: article.dislikes.length || 0,
      blocks: article.blocks.length || 0,
      tags: article.tags,
      author: article.author,
      createdAt: article.createdAt,
      userReaction: hasLiked ? 'like' : hasDisLiked ? 'dislike' : null,
    };
  };

  updateArticleInfo = async (userId: string, articleId: string, data: ArticleFormData) => {
    const updatedData = {
      ...data,
      author: new mongoose.Types.ObjectId(userId),
    };
    const article = await this._articleRepo.updateById(articleId, { $set: updatedData });
    if (!article) {
      throw new AppError(HttpStatus.NOT_FOUND, messages.NOT_FOUND);
    }
  };

  getArticleList = async (userId: string, page: number) => {
    const user = await this._userRepo.findById(userId);
    if (!user) {
      throw new AppError(HttpStatus.NOT_FOUND, messages.NOT_FOUND);
    }
    const limit = 8;

    const skip = (page - 1) * limit;
    const articles = await this._articleRepo.findAll(
      {
        $and: [
          { category: { $in: user.preferences } },
          { _id: { $nin: user.blockedArticles } },
          { author: { $ne: user.id } },
        ],
      },
      { limit, skip }
    );

    const totalArticles = await this._articleRepo.countDocuments({
      $and: [
        { category: { $in: user.preferences } },
        { _id: { $nin: user.blockedArticles } },
        { author: { $ne: user.id } },
      ],
    });
    const totalPages = Math.ceil(totalArticles / limit);
    const updatedArticles = articles.map((ar) => ({
      id: ar.id as string,
      title: ar.title,
      imageUrl: ar.imageUrl,
      category: ar.category,
      likes: ar.likes.length || 0,
      dislikes: ar.dislikes.length || 0,
      tags: ar.tags,
      createdAt: ar.createdAt,
    }));

    return {
      articles: updatedArticles,
      hasMore: totalPages > page,
    };
  };

  changeReaction = async (userId: string, articleId: string, reaction: 'like' | 'dislike') => {
    const article = await this._articleRepo.findById(articleId);
    if (!article) throw new AppError(HttpStatus.NOT_FOUND, messages.NOT_FOUND);

    const userObjId = new mongoose.Types.ObjectId(userId);
    let updatedArticle;
    if (reaction === 'like') {
      if (article.likes.includes(userObjId)) {
        updatedArticle = await this._articleRepo.updateById(articleId, {
          $pull: { likes: userObjId },
        });
      } else {
        updatedArticle = await this._articleRepo.updateById(articleId, {
          $push: { likes: userObjId },
          $pull: { dislikes: userObjId },
        });
      }
    } else if (reaction === 'dislike') {
      if (article.dislikes.includes(userObjId)) {
        updatedArticle = await this._articleRepo.updateById(articleId, {
          $pull: { dislikes: userObjId },
        });
      } else {
        updatedArticle = await this._articleRepo.updateById(articleId, {
          $push: { dislikes: userObjId },
          $pull: { likes: userObjId },
        });
      }
    }
    if (!updatedArticle) {
      throw new AppError(HttpStatus.BAD_REQUEST, messages.BAD_REQUEST);
    }
    const hasLiked = updatedArticle.likes.includes(userObjId);
    const hasDisLiked = updatedArticle.dislikes.includes(userObjId);
    return {
      likes: updatedArticle.likes.length || 0,
      dislikes: updatedArticle.dislikes.length || 0,
      userReaction: hasLiked ? 'like' : hasDisLiked ? 'dislike' : null,
    };
  };

  bArticle = async (userId: string, articleId: string) => {
    const article = await this._articleRepo.findById(articleId);
    if (!article) {
      throw new AppError(HttpStatus.NOT_FOUND, messages.NOT_FOUND);
    }

    const user = await this._userRepo.updateById(userId, {
      $addToSet: { blockedArticles: new mongoose.Types.ObjectId(articleId) },
    });
    const updatedArticle = await this._articleRepo.updateById(articleId, {
      $addToSet: { blocks: new mongoose.Types.ObjectId(userId) },
    });

    if (!user || !updatedArticle) {
      throw new AppError(HttpStatus.NOT_FOUND, messages.NOT_FOUND);
    }
  };

  deleteArticleInfo = async (userId: string, articleId: string) => {
    const article = await this._articleRepo.findById(articleId);
    if (!article) {
      throw new AppError(HttpStatus.NOT_FOUND, messages.NOT_FOUND);
    }

    await this._userRepo.update(
      { blockedArticles: { $in: [article._id] } },
      { $pull: { blockedArticles: article._id } }
    );

    const deleted = await this._articleRepo.deleteArticle(articleId);
    if (!deleted) {
      throw new AppError(HttpStatus.NOT_FOUND, messages.NOT_FOUND);
    }

    return deleted;
  };
}
