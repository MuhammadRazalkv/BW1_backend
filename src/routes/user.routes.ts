import { Router } from 'express';
import { createUser, resendVerificationEmail, verifyEmail , login } from '../controller/user.controller';
const userRoute = Router();

userRoute
  .post('/user', createUser)
  .get('/verify-email', verifyEmail)
  .post('/resend-verification', resendVerificationEmail)
  .post('/login',login)
export default userRoute;
