import { NextFunction, Request, Response } from 'express';
import { validate } from '../utils/validate.zod';
import { fieldSchemas, signupSchema, UpdateSchema } from '../dto/req.dto';
import {
  getUserPreferences,
  newUser,
  resendVerificationEmailAddress,
  updatePassword,
  updateUserInfo,
  updateUserPref,
  updateUserProfileImg,
  userLogin,
  userProfile,
  verifyEmailAddress,
  verifyTokens,
} from '../service/user.service';
import { sendSuccess } from '../utils/response.util';
import { HttpStatus } from '../constants/statusCodes';
import { messages } from '../constants/httpStatusMessages';
import { ExtendedRequest } from '../middlewares/auth.middleware';
import { AppError } from '../utils/app.error';
import { passwordSchema } from '../dto/password.dto';

export const createUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = validate(signupSchema, req.body);
    const email = await newUser(data);
    sendSuccess(res, HttpStatus.CREATED, { email });
  } catch (error) {
    next(error);
  }
};
export const verifyEmail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.query.token;
    await verifyEmailAddress(token as string);
    sendSuccess(res, HttpStatus.OK, {}, messages.EMAIL_VERIFICATION_SUCCESS);
  } catch (error) {
    next(error);
  }
};
export const resendVerificationEmail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const email = req.body.email;
    await resendVerificationEmailAddress(email as string);
    sendSuccess(res, HttpStatus.OK, {}, messages.EMAIL_HAS_SEND);
  } catch (error) {
    next(error);
  }
};
export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, phone, password } = req.body;

    const { accessToken, refreshToken } = await userLogin(password, email, phone);
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
export const userInfo = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.id;
    if (!id) {
      throw new AppError(HttpStatus.BAD_REQUEST, messages.TOKEN_NOTFOUND);
    }
    const user = await userProfile(id);
    console.log(user);

    sendSuccess(res, HttpStatus.OK, { user });
  } catch (error) {
    next(error);
  }
};
export const updateUser = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.id;
    if (!id) {
      throw new AppError(HttpStatus.BAD_REQUEST, messages.TOKEN_NOTFOUND);
    }
    const field = req.body.field as keyof UpdateSchema;
    const validatedValue = validate(fieldSchemas[field], req.body.value);
    const user = await updateUserInfo(id, field, validatedValue as string);

    sendSuccess(res, HttpStatus.OK, { user }, messages.UPDATED);
  } catch (error) {
    next(error);
  }
};
export const updatePreferences = async (
  req: ExtendedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.id;
    if (!id) {
      throw new AppError(HttpStatus.BAD_REQUEST, messages.TOKEN_NOTFOUND);
    }
    const value = req.body;
    if (!value.length) {
      throw new AppError(HttpStatus.BAD_REQUEST, messages.NOT_ENOUGH_PREF);
    }

    const preferences = await updateUserPref(id, value);

    sendSuccess(res, HttpStatus.OK, { preferences }, messages.UPDATED);
  } catch (error) {
    next(error);
  }
};
export const getPreferences = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.id;
    if (!id) {
      throw new AppError(HttpStatus.BAD_REQUEST, messages.TOKEN_NOTFOUND);
    }

    const preferences = await getUserPreferences(id);

    sendSuccess(res, HttpStatus.OK, { preferences });
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (
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

    await updatePassword(id, data.currentPassword, data.newPassword);
    sendSuccess(res, HttpStatus.OK, {}, messages.UPDATED);
  } catch (error) {
    next(error);
  }
};

export const updateProfileImg = async (
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
    const url = await updateUserProfileImg(id, fileUrl);
    sendSuccess(res, HttpStatus.CREATED, { url });
  } catch (error) {
    next(error);
  }
};
export const refreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.cookies?.refreshToken;

    if (!token) {
      throw new AppError(HttpStatus.UNAUTHORIZED, messages.TOKEN_NOTFOUND);
    }

    const { accessToken, refreshToken } = await verifyTokens(token);

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
