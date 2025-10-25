import mongoose from 'mongoose';
import { messages } from '../constants/httpStatusMessages';
import { HttpStatus } from '../constants/statusCodes';
import { ArticleFormData } from '../dto/article.dto';
import { Article, IArticle } from '../model/articles.model';
import { AppError } from '../utils/app.error';
import User from '../model/user.model';
export const newArticle = async (userId: string, data: Partial<IArticle>) => {
  const article = await Article.create({ ...data, author: new mongoose.Types.ObjectId(userId) });
};

export const userArticles = async (userId: string, page: number) => {
  const limit = 6;
  const skip = (page - 1) * limit;

  const userObjectId = new mongoose.Types.ObjectId(userId);

  const totalArticles = await Article.countDocuments({ author: userObjectId });

  const articles = await Article.find({ author: userObjectId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const totalPages = Math.ceil(totalArticles / limit);
  const updatedArticles = articles.map((ar) => ({
    id: ar.id,
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

export const getArticleInfo = async (userId: string, articleId: string) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(HttpStatus.NOT_FOUND, messages.NOT_FOUND);
  }
  const article = await Article.findById(articleId).populate({
    path: 'author',
    select: 'firstName profilePic',
  });
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
    id: article.id,
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

export const updateArticleInfo = async (
  userId: string,
  articleId: string,
  data: ArticleFormData
) => {
  const updatedData = {
    ...data,
    author: new mongoose.Types.ObjectId(userId),
  };
  console.log('data  ', updatedData);

  const article = await Article.findByIdAndUpdate(articleId, { $set: updatedData }, { new: true });
  if (!article) {
    throw new AppError(HttpStatus.NOT_FOUND, messages.NOT_FOUND);
  }
};

export const getArticleList = async (userId: string, page: number) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(HttpStatus.NOT_FOUND, messages.NOT_FOUND);
  }
  const limit = 8;

  const skip = (page - 1) * limit;
  const articles = await Article.find({
    $and: [
      { category: { $in: user.preferences } },
      { _id: { $nin: user.blockedArticles } },
      { author: { $ne: user.id } },
    ],
  })
    .limit(limit)
    .skip(skip);
  const totalArticles = await Article.countDocuments({
    $and: [
      { category: { $in: user.preferences } },
      { _id: { $nin: user.blockedArticles } },
      { author: { $ne: user.id } },
    ],
  });
  const totalPages = Math.ceil(totalArticles / limit);
  const updatedArticles = articles.map((ar) => ({
    id: ar.id,
    title: ar.title,
    imageUrl: ar.imageUrl,
    category: ar.category,
    likes: ar.likes.length || 0,
    dislikes: ar.dislikes.length || 0,
    tags: ar.tags,
    createdAt: ar.createdAt,
  }));
  console.log(updatedArticles);

  return {
    articles: updatedArticles,
    hasMore: totalPages > page,
  };
};

export const changeReaction = async (
  userId: string,
  articleId: string,
  reaction: 'like' | 'dislike'
) => {
  const article = await Article.findById(articleId);
  if (!article) throw new AppError(HttpStatus.NOT_FOUND, messages.NOT_FOUND);

  const userObjId = new mongoose.Types.ObjectId(userId);
  let updatedArticle;
  if (reaction === 'like') {
    if (article.likes.includes(userObjId)) {
      updatedArticle = await Article.findByIdAndUpdate(
        articleId,
        { $pull: { likes: userObjId } },
        { new: true }
      );
    } else {
      updatedArticle = await Article.findByIdAndUpdate(
        articleId,
        {
          $push: { likes: userObjId },
          $pull: { dislikes: userObjId },
        },
        { new: true }
      );
    }
  } else if (reaction === 'dislike') {
    if (article.dislikes.includes(userObjId)) {
      updatedArticle = await Article.findByIdAndUpdate(
        articleId,
        {
          $pull: { dislikes: userObjId },
        },
        { new: true }
      );
    } else {
      updatedArticle = await Article.findByIdAndUpdate(
        articleId,
        {
          $push: { dislikes: userObjId },
          $pull: { likes: userObjId },
        },
        { new: true }
      );
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

export const bArticle = async (userId: string, articleId: string) => {
  const article = await Article.findById(articleId);
  if (!article) {
    throw new AppError(HttpStatus.NOT_FOUND, messages.NOT_FOUND);
  }

  const user = await User.findByIdAndUpdate(
    userId,
    { $addToSet: { blockedArticles: new mongoose.Types.ObjectId(articleId) } },
    { new: true }
  );
  const updatedArticle = await Article.findByIdAndUpdate(
    articleId,
    { $addToSet: { blocks: new mongoose.Types.ObjectId(userId) } },
    { new: true }
  );

  if (!user || !updatedArticle) {
    throw new AppError(HttpStatus.NOT_FOUND, messages.NOT_FOUND);
  }
};

export const deleteArticleInfo = async (userId: string, articleId: string) => {
  const article = await Article.findById(articleId);
  if (!article) {
    throw new AppError(HttpStatus.NOT_FOUND, messages.NOT_FOUND);
  }

  await User.updateMany(
    { blockedArticles: { $in: [article._id] } },
    { $pull: { blockedArticles: article._id } }
  );

  const deleted = await Article.findByIdAndDelete(articleId);
  if (!deleted) {
    throw new AppError(HttpStatus.NOT_FOUND, messages.NOT_FOUND);
  }

  return deleted;
};
