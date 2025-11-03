import { NextFunction, Request, Response } from 'express';
import { validate } from '../utils/validate.zod';
import { fieldSchemas, signupSchema, UpdateSchema } from '../dto/req.dto';
import { sendSuccess } from '../utils/response.util';
import { HttpStatus } from '../constants/statusCodes';
import { messages } from '../constants/httpStatusMessages';
import { ExtendedRequest } from '../middlewares/auth.middleware';
import { AppError } from '../utils/app.error';
import { passwordSchema } from '../dto/password.dto';
import { IUserController } from './interfaces/user.controller.interface';
import { IUserService } from '../service/interfaces/user.service.interface';

export default class UserController implements IUserController {
  constructor(private _userService: IUserService) {}

  createUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = validate(signupSchema, req.body);
      const email = await this._userService.newUser(data);
      sendSuccess(res, HttpStatus.CREATED, { email });
    } catch (error) {
      next(error);
    }
  };

  verifyEmail = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.query.token;
      await this._userService.verifyEmailAddress(token as string);
      sendSuccess(res, HttpStatus.OK, {}, messages.EMAIL_VERIFICATION_SUCCESS);
    } catch (error) {
      next(error);
    }
  };

  resendVerificationEmail = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const email = req.body.email;
      await this._userService.resendVerificationEmailAddress(email as string);
      sendSuccess(res, HttpStatus.OK, {}, messages.EMAIL_HAS_SEND);
    } catch (error) {
      next(error);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, phone, password } = req.body;

      const { accessToken, refreshToken } = await this._userService.userLogin(
        password,
        email,
        phone
      );
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      sendSuccess(res, HttpStatus.OK, { accessToken });
    } catch (error) {
      next(error);
    }
  };

  userInfo = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
    try {
      const id = req.id;
      if (!id) {
        throw new AppError(HttpStatus.BAD_REQUEST, messages.TOKEN_NOTFOUND);
      }
      const user = await this._userService.userProfile(id);
      sendSuccess(res, HttpStatus.OK, { user });
    } catch (error) {
      next(error);
    }
  };

  updateUser = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
    try {
      const id = req.id;
      if (!id) {
        throw new AppError(HttpStatus.BAD_REQUEST, messages.TOKEN_NOTFOUND);
      }
      const field = req.body.field as keyof UpdateSchema;
      const validatedValue = validate(fieldSchemas[field], req.body.value);
      const user = await this._userService.updateUserInfo(id, field, validatedValue as string);

      sendSuccess(res, HttpStatus.OK, { user }, messages.UPDATED);
    } catch (error) {
      next(error);
    }
  };

  updatePreferences = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
    try {
      const id = req.id;
      if (!id) {
        throw new AppError(HttpStatus.BAD_REQUEST, messages.TOKEN_NOTFOUND);
      }
      const value = req.body;
      if (!value.length) {
        throw new AppError(HttpStatus.BAD_REQUEST, messages.NOT_ENOUGH_PREF);
      }

      const preferences = await this._userService.updateUserPref(id, value);

      sendSuccess(res, HttpStatus.OK, { preferences }, messages.UPDATED);
    } catch (error) {
      next(error);
    }
  };

  getPreferences = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
    try {
      const id = req.id;
      if (!id) {
        throw new AppError(HttpStatus.BAD_REQUEST, messages.TOKEN_NOTFOUND);
      }

      const preferences = await this._userService.getUserPreferences(id);

      sendSuccess(res, HttpStatus.OK, { preferences });
    } catch (error) {
      next(error);
    }
  };

  changePassword = async (
    req: ExtendedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = req.id;
      if (!id) {
        throw new AppError(HttpStatus.BAD_REQUEST, messages.TOKEN_NOTFOUND);
      }
      const data = validate(passwordSchema, req.body);
      console.log(data);

      await this._userService.updatePassword(id, data.currentPassword, data.newPassword);
      sendSuccess(res, HttpStatus.OK, {}, messages.UPDATED);
    } catch (error) {
      next(error);
    }
  };

  updateProfileImg = async (
    req: ExtendedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = req.id;
      if (!id) {
        throw new AppError(HttpStatus.BAD_REQUEST, messages.TOKEN_NOTFOUND);
      }
      if (!req.file) {
        throw new AppError(HttpStatus.BAD_REQUEST, messages.NO_FILE_UPLOADED);
      }
      const fileUrl = req.file.path;
      const url = await this._userService.updateUserProfileImg(id, fileUrl);
      sendSuccess(res, HttpStatus.CREATED, { url });
    } catch (error) {
      next(error);
    }
  };

  refreshToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const token = req.cookies?.refreshToken;

      if (!token) {
        throw new AppError(HttpStatus.UNAUTHORIZED, messages.TOKEN_NOTFOUND);
      }

      const { accessToken, refreshToken } = await this._userService.verifyTokens(token);

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      sendSuccess(res, HttpStatus.CREATED, { accessToken });
    } catch (error) {
      next(error);
    }
  };

  logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      res.clearCookie('refreshToken');
      sendSuccess(res, HttpStatus.OK, {});
    } catch (error) {
      next(error);
    }
  };
}
