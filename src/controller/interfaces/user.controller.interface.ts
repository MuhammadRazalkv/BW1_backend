import { NextFunction, Request, Response } from 'express';
import { ExtendedRequest } from '../../middlewares/auth.middleware';

export interface IUserController {
  createUser: (req: Request, res: Response, next: NextFunction) => Promise<void>;
  verifyEmail: (req: Request, res: Response, next: NextFunction) => Promise<void>;
  resendVerificationEmail: (req: Request, res: Response, next: NextFunction) => Promise<void>;
  login: (req: Request, res: Response, next: NextFunction) => Promise<void>;
  userInfo: (req: ExtendedRequest, res: Response, next: NextFunction) => Promise<void>;
  updateUser: (req: ExtendedRequest, res: Response, next: NextFunction) => Promise<void>;
  updatePreferences: (req: ExtendedRequest, res: Response, next: NextFunction) => Promise<void>;
  getPreferences: (req: ExtendedRequest, res: Response, next: NextFunction) => Promise<void>;
  changePassword: (req: ExtendedRequest, res: Response, next: NextFunction) => Promise<void>;
  updateProfileImg: (req: ExtendedRequest, res: Response, next: NextFunction) => Promise<void>;
  refreshToken: (req: Request, res: Response, next: NextFunction) => Promise<void>;
}
