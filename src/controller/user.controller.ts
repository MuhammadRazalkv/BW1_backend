import { NextFunction, Request, Response } from 'express';
import { validate } from '../utils/validate.zod';
import { signupSchema } from '../dto/req.dto';
import {
  newUser,
  resendVerificationEmailAddress,
  userLogin,
  verifyEmailAddress,
} from '../service/user.service';
import { sendSuccess } from '../utils/response.util';
import { HttpStatus } from '../constants/statusCodes';
import { messages } from '../constants/httpStatusMessages';

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
