import { messages } from '../constants/httpStatusMessages';
import { HttpStatus } from '../constants/statusCodes';
import { html } from '../constants/verification';
import { SignupFormData, UpdateSchema } from '../dto/req.dto';
import User from '../model/user.model';
import { IUserRepo } from '../repository/interface/user.repo.interface';
import { AppError } from '../utils/app.error';
import { comparePassword, hashPassword } from '../utils/hashing';
import {
  decodeVerificationToken,
  generateBothTokens,
  generateVerificationToken,
  verifyRefreshToken,
} from '../utils/jwt';
import sendEmail from '../utils/mailsender';
import { IUserService } from './interfaces/user.service.interface';

export default class UserService implements IUserService {
  constructor(private _userRepo: IUserRepo) {}

  newUser = async (data: SignupFormData): Promise<string> => {
    try {
      const updatedData = {
        ...data,
        dob: new Date(data.dob),
        phone: parseInt(data.phone),
        password: await hashPassword(data.password),
      };
      const user = await this._userRepo.create(updatedData);
      const token = generateVerificationToken(user.id);
      const link = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
      sendEmail(user.email, 'Verify Your Email', html(link)).catch((err) => {
        console.error(err);
        throw new AppError(HttpStatus.INTERNAL_SERVER_ERROR, messages.SERVER_ERROR);
      });
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

  verifyEmailAddress = async (token: string) => {
    if (!token) {
      throw new AppError(HttpStatus.BAD_REQUEST, messages.TOKEN_NOTFOUND);
    }
    const userId = decodeVerificationToken(token);
    const user = await this._userRepo.findById(userId);
    if (!user) {
      throw new AppError(HttpStatus.NOT_FOUND, messages.NOT_FOUND);
    }
    await this._userRepo.updateById(userId, { $set: { isVerified: true } });
  };

  resendVerificationEmailAddress = async (email: string) => {
    if (!email) {
      throw new AppError(HttpStatus.BAD_REQUEST, messages.BAD_REQUEST);
    }
    const user = await this._userRepo.findOne({ email });
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

  userLogin = async (password: string, email?: string, phone?: string) => {
    if ((!email && !phone) || !password) {
      throw new AppError(HttpStatus.BAD_REQUEST, messages.BAD_REQUEST);
    }
    const user = await this._userRepo.findOne({ $or: [{ email }, { phone }] });
    if (!user) {
      throw new AppError(HttpStatus.NOT_FOUND, messages.NOT_FOUND);
    }
    if (!user.isVerified) {
      throw new AppError(HttpStatus.UNAUTHORIZED, messages.ACCOUNT_NOT_VERIFIED);
    }
    const isPasswordMatch = await comparePassword(password, user.password);
    if (!isPasswordMatch) {
      throw new AppError(HttpStatus.BAD_REQUEST, messages.INVALID_LOGIN_CREDENTIALS);
    }
    return generateBothTokens(user.id);
  };

  findUserById = async (userId: string) => {
    return await this._userRepo.findById(userId);
  };

  userProfile = async (userId: string) => {
    const user = await this._userRepo.findById(userId);
    if (!user) {
      throw new AppError(HttpStatus.NOT_FOUND, messages.NOT_FOUND);
    }
    return {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      dob: user.dob,
      profilePic: user.profilePic,
    };
  };

  verifyTokens = async (
    token: string
  ): Promise<{
    accessToken: string;
    refreshToken: string;
  }> => {
    if (!token) {
      throw new AppError(HttpStatus.UNAUTHORIZED, messages.TOKEN_NOTFOUND);
    }

    const refresh = verifyRefreshToken(token);
    if (!refresh) {
      throw new AppError(HttpStatus.BAD_REQUEST, messages.INVALID_TOKEN);
    }

    return generateBothTokens(refresh.id);
  };

  updateUserInfo = async (userId: string, field: keyof UpdateSchema, value: string) => {
    try {
      let data: string | number | Date = value;

      if (field === 'dob') {
        data = new Date(value);
      } else if (field === 'phone') {
        data = parseInt(value);
      }

      const user = await this._userRepo.updateById(userId, { [field]: data });

      if (!user) {
        throw new AppError(HttpStatus.NOT_FOUND, 'Failed to update user');
      }

      return {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        dob: user.dob,
        profilePic: user.profilePic,
      };
    } catch (error: any) {
      if (error.code === 11000) {
        const field = Object.keys(error.keyPattern)[0];
        const info = field === 'phone' ? 'number' : 'address';
        throw new AppError(
          HttpStatus.CONFLICT,
          `${field.charAt(0).toUpperCase() + field.slice(1)} ${info} already exists`
        );
      }

      throw new AppError(HttpStatus.INTERNAL_SERVER_ERROR, 'Error updating user info');
    }
  };

  getUserPreferences = async (userId: string) => {
    const user = await this._userRepo.findById(userId);
    if (!user) {
      throw new AppError(HttpStatus.NOT_FOUND, messages.NOT_FOUND);
    }
    return user.preferences || [];
  };

  updatePassword = async (userId: string, currPassword: string, newPassword: string) => {
    const user = await this._userRepo.findById(userId);
    if (!user) {
      throw new AppError(HttpStatus.NOT_FOUND, messages.NOT_FOUND);
    }
    const isPasswordMatch = await comparePassword(currPassword, user.password);
    if (!isPasswordMatch) {
      throw new AppError(HttpStatus.BAD_REQUEST, messages.PASSWORD_NOT_MATCH);
    }
    const updatedUser = await this._userRepo.updateById(userId, {
      password: await hashPassword(newPassword),
    });
    if (!updatedUser) {
      throw new AppError(HttpStatus.BAD_REQUEST, 'Failed to update password');
    }
  };

  updateUserPref = async (userId: string, preference: string[]) => {
    const user = await this._userRepo.updateById(userId, { preferences: preference });
    if (!user) {
      throw new AppError(HttpStatus.NOT_FOUND, messages.NOT_FOUND);
    }
    return user.preferences;
  };

  updateUserProfileImg = async (userId: string, url: string) => {
    const user = await this._userRepo.updateById(userId, { profilePic: url });
    if (!user) {
      throw new AppError(HttpStatus.NOT_FOUND, messages.NOT_FOUND);
    }
    return user.profilePic;
  };
}
