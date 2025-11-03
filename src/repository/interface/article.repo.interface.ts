import { IArticle } from "../../model/articles.model";
import { BaseRepository } from "../base.repo";

export interface IArticleRepo extends BaseRepository<IArticle> {}