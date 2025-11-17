import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import uploadMiddleware from '../utils/multer';
import UserController from '../controller/user.controller';
import { UserRepo } from '../repository/user.repo';
import UserService from '../service/user.service';
import { validateBody } from '../middlewares/validate.body.middleware';
import { emailSchema, loginSchema, signupSchema, tokenSchema } from '../dto/req.dto';
import { validateQuery } from '../middlewares/validate.query.middleware';
import { passwordSchema } from '../dto/password.dto';
const userRepo = new UserRepo();
export const userService = new UserService(userRepo);
const controller = new UserController(userService);
const userRoute = Router();
const upload = uploadMiddleware('user-profile');

userRoute
  .post('/user', validateBody(signupSchema), controller.createUser)
  .get('/verify-email', validateQuery(tokenSchema), controller.verifyEmail)
  .post('/resend-verification', validateBody(emailSchema), controller.resendVerificationEmail)
  .post('/login', validateBody(loginSchema), controller.login)
  .post('/refresh', controller.refreshToken)
  .get('/user', authMiddleware, controller.userInfo)
  .patch('/user', authMiddleware, controller.updateUser)
  .get('/preferences', authMiddleware, controller.getPreferences)
  .patch(
    '/change-password',
    authMiddleware,
    validateBody(passwordSchema),
    controller.changePassword
  )
  .patch('/preferences', authMiddleware, controller.updatePreferences)
  .post('/upload-profile', authMiddleware, upload.single('profilePic'), controller.updateProfileImg)
  .post('/logout', authMiddleware, controller.logout);

export default userRoute;
