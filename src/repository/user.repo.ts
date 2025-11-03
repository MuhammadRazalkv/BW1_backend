import User, { IUser } from '../model/user.model';
import { BaseRepository } from './base.repo';
import { IUserRepo } from './interface/user.repo.interface';

export class UserRepo extends BaseRepository<IUser> implements IUserRepo {
  constructor() {
    super(User);
  }
}
