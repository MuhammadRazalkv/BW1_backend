import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { AppError } from './app.error';
import { HttpStatus } from '../constants/statusCodes';

dotenv.config();

const ACCESS_SECRET = process.env.ACCESS_SECRET || 'access_secret';
const REFRESH_SECRET = process.env.REFRESH_SECRET || 'refresh_secret';

export const generateVerificationToken = (userId: string) => {
  return jwt.sign({ id: userId }, ACCESS_SECRET, { expiresIn: '10m' });
};

export const decodeVerificationToken = (token: string) => {
  try {
    const decoded = jwt.verify(token, ACCESS_SECRET) as { id: string };
    return decoded.id;
  } catch (error) {
    throw new AppError(HttpStatus.UNAUTHORIZED, 'Invalid or expired token');
  }
};

// Generate Access Token
export const generateAccessToken = (userId: string) => {
  return jwt.sign({ id: userId }, ACCESS_SECRET, { expiresIn: '20m' });
};

// Generate Refresh Token
export const generateRefreshToken = (userId: string) => {
  return jwt.sign({ id: userId }, REFRESH_SECRET, { expiresIn: '7d' });
};

// Verify Access Token
export const verifyAccessToken = (token: string): { id: string } => {
  return jwt.verify(token, ACCESS_SECRET) as { id: string };
};

// Verify Refresh Token
export const verifyRefreshToken = (token: string): { id: string } => {
  return jwt.verify(token, REFRESH_SECRET) as { id: string };
};

// Verify Forgot Password Token
export const verifyForgotPasswordToken = (token: string) => {
  try {
    return jwt.verify(token, REFRESH_SECRET);
  } catch (error) {
    console.error('Forgot Password Token Invalid:', error);
    return null;
  }
};

// Extract User ID from Access Token
// export const extractUserIdFromToken = (token: string) => {
//   try {
//     const decoded = jwt.verify(token, ACCESS_SECRET) as string;
//     return decoded.id;
//   } catch (error) {
//     console.error('Error verifying token:', error);
//     throw error;
//   }
// };

export const generateBothTokens = (id: string) => ({
  accessToken: generateAccessToken(id),
  refreshToken: generateRefreshToken(id),
});
