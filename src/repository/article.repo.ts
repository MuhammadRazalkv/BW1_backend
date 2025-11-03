import Article, { IArticle } from '../model/articles.model';
import { IUser } from '../model/user.model';
import { BaseRepository } from './base.repo';
import { IArticlePopulated, IArticleRepo } from './interface/article.repo.interface';

export class ArticleRepo extends BaseRepository<IArticle> implements IArticleRepo {
  constructor() {
    super(Article);
  }
  populatedArticleInfo = async (articleId: string): Promise<IArticlePopulated | null> => {
    const article = await Article.findById(articleId)
      .populate<{ author: Pick<IUser, '_id' | 'firstName' | 'profilePic'> }>({
        path: 'author',
        select: 'firstName profilePic',
      })
      .lean()
      .exec();

    return article;
  };
  deleteArticle = async (articleId: string): Promise<IArticle | null> => {
    const article = await Article.findByIdAndDelete(articleId);
    return article;
  };
}
