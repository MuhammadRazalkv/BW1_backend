import { messages } from '../constants/httpStatusMessages';
import { HttpStatus } from '../constants/statusCodes';
import { html } from '../constants/verification';
import { SignupSchema } from '../dto/req.dto';
import User from '../model/user.model';
import { AppError } from '../utils/app.error';
import { comparePassword, hashPassword } from '../utils/hashing';
import {
  decodeVerificationToken,
  generateBothTokens,
  generateVerificationToken,
} from '../utils/jwt';
import sendEmail from '../utils/mailsender';

export const newUser = async (data: SignupSchema): Promise<string> => {
  try {
    const updatedData = { ...data, password: await hashPassword(data.password) };
    const user = await User.create(updatedData);
    const token = generateVerificationToken(user.id);
    const link = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
    sendEmail(user.email, 'Verify Your Email', html(link));
    return user.email;
  } catch (error: any) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      const info = field === 'phone' ? 'number' : 'address';
      throw new AppError(
        HttpStatus.CONFLICT,
        `${field.charAt(0).toUpperCase() + field.slice(1)} ${info} already exists`
      );
    }
    throw new AppError(HttpStatus.INTERNAL_SERVER_ERROR, messages.DATABASE_OPERATION_FAILED);
  }
};
export const verifyEmailAddress = async (token: string) => {
  if (!token) {
    throw new AppError(HttpStatus.BAD_REQUEST, messages.TOKEN_NOTFOUND);
  }
  const userId = decodeVerificationToken(token);
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(HttpStatus.NOT_FOUND, messages.NOT_FOUND);
  }
  await User.findByIdAndUpdate(userId, { $set: { isVerified: true } });
};
export const resendVerificationEmailAddress = async (email: string) => {
  if (!email) {
    throw new AppError(HttpStatus.BAD_REQUEST, messages.BAD_REQUEST);
  }
  const user = await User.findOne({ email });
  if (!user) {
    throw new AppError(HttpStatus.NOT_FOUND, messages.NOT_FOUND);
  }
  if (user.isVerified) {
    throw new AppError(HttpStatus.BAD_REQUEST, messages.ACCOUNT_ALREADY_VERIFIED);
  }
  const token = generateVerificationToken(user.id);
  const link = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
  sendEmail(user.email, 'Verify Your Email', html(link)).catch((err) => {
    throw new AppError(HttpStatus.INTERNAL_SERVER_ERROR, 'Failed send email');
  });
};
export const userLogin = async (password: string, email?: string, phone?: string) => {
  if ((!email && !phone) || !password) {
    throw new AppError(HttpStatus.BAD_REQUEST, messages.BAD_REQUEST);
  }
  const user = await User.findOne({ $or: [{ email }, { phone }] });
  if (!user) {
    throw new AppError(HttpStatus.NOT_FOUND, messages.NOT_FOUND);
  }
  if (!user.isVerified) {
    throw new AppError(HttpStatus.UNAUTHORIZED, messages.ACCOUNT_NOT_VERIFIED);
  }
  const isPasswordMatch = comparePassword(password, user.password);
  if (!isPasswordMatch) {
    throw new AppError(HttpStatus.BAD_REQUEST, messages.INVALID_LOGIN_CREDENTIALS);
  }
  return generateBothTokens(user.id);
};
