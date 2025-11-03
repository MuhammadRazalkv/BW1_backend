import { SignupFormData } from '../../dto/req.dto';
import { IUser } from '../../model/user.model';

export interface IUserService {
  newUser: (data: SignupFormData) => Promise<string>;
  verifyEmailAddress: (token: string) => Promise<void>;
  resendVerificationEmailAddress: (email: string) => Promise<void>;
  userLogin: (
    password: string,
    email?: string | undefined,
    phone?: string | undefined
  ) => Promise<{
    accessToken: string;
    refreshToken: string;
  }>;
  userProfile: (userId: string) => Promise<{
    firstName: string;
    lastName: string;
    email: string;
    phone: number;
    dob: Date;
    profilePic: string | undefined;
  }>;
  verifyTokens: (token: string) => Promise<{
    accessToken: string;
    refreshToken: string;
  }>;
  updateUserInfo: (
    userId: string,
    field: never,
    value: string
  ) => Promise<{
    firstName: string;
    lastName: string;
    email: string;
    phone: number;
    dob: Date;
    profilePic: string | undefined;
  }>;
  getUserPreferences: (userId: string) => Promise<string[]>;
  updatePassword: (userId: string, currPassword: string, newPassword: string) => Promise<void>;
  updateUserPref: (userId: string, preference: string[]) => Promise<string[]>;
  updateUserProfileImg: (userId: string, url: string) => Promise<string | undefined>;
  findUserById: (userId: string) => Promise<IUser | null>;
}
