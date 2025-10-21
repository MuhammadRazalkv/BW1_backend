import { Router } from 'express';
import {
  createUser,
  resendVerificationEmail,
  verifyEmail,
  login,
  userInfo,
  refreshToken,
  updateUser,
  getPreferences,
  changePassword,
} from '../controller/user.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
const userRoute = Router();

userRoute
  .post('/user', createUser)
  .get('/verify-email', verifyEmail)
  .post('/resend-verification', resendVerificationEmail)
  .post('/login', login)
  .post('/refresh', refreshToken)
  .get('/user', authMiddleware, userInfo)
  .patch('/user', authMiddleware, updateUser)
  .get('/preferences', authMiddleware, getPreferences)
  .patch('/change-password', authMiddleware, changePassword);
export default userRoute;
