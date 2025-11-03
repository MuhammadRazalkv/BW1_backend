import { IArticle } from '../../model/articles.model';
import { IUser } from '../../model/user.model';
import { BaseRepository } from '../base.repo';
export interface IArticlePopulated extends Omit<IArticle, 'author'> {
  author: Pick<IUser, '_id' | 'firstName' | 'profilePic'>;
}

export interface IArticleRepo extends BaseRepository<IArticle> {
  populatedArticleInfo: (articleId: string) => Promise<IArticlePopulated | null>;
  deleteArticle: (articleId: string) => Promise<IArticle | null>;
}
