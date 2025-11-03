import { IUser } from '../../model/user.model';
import { IBaseRepository } from './base.repo.interface';

export interface IUserRepo extends IBaseRepository<IUser> {}
