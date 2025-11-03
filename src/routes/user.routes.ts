import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import uploadMiddleware from '../utils/multer';
import UserController from '../controller/user.controller';
import { UserRepo } from '../repository/user.repo';
import UserService from '../service/user.service';
const userRepo = new UserRepo();
export const userService = new UserService(userRepo);
const controller = new UserController(userService);
const userRoute = Router();
const upload = uploadMiddleware('user-profile');


userRoute
  .post('/user', controller.createUser)
  .get('/verify-email', controller.verifyEmail)
  .post('/resend-verification', controller.resendVerificationEmail)
  .post('/login', controller.login)
  .post('/refresh', controller.refreshToken)
  .get('/user', authMiddleware, controller.userInfo)
  .patch('/user', authMiddleware, controller.updateUser)
  .get('/preferences', authMiddleware, controller.getPreferences)
  .patch('/change-password', authMiddleware, controller.changePassword)
  .patch('/preferences', authMiddleware, controller.updatePreferences)
  .post('/upload-profile', authMiddleware, upload.single('profilePic'), controller.updateProfileImg)
  .post('/logout', authMiddleware, controller.logout);

  
export default userRoute;
