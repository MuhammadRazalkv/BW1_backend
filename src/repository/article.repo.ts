import Article,{ IArticle } from "../model/articles.model";
import { BaseRepository } from "./base.repo";
import { IArticleRepo } from "./interface/article.repo.interface";

export class ArticleRepo extends BaseRepository<IArticle> implements IArticleRepo {
  constructor() {
    super(Article);
  }
}
