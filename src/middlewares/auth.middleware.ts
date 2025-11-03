import { Request, Response, NextFunction } from 'express';
import { HttpStatus } from '../constants/statusCodes';
import { messages } from '../constants/httpStatusMessages';
import { userService } from '../routes/user.routes';
import { sendError } from '../utils/response.util';
import { verifyAccessToken } from '../utils/jwt';

const ACCESS_SECRET = process.env.ACCESS_SECRET || 'access_secret';
export interface ExtendedRequest extends Request {
  id?: string;
}

export const authMiddleware = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    sendError(res, HttpStatus.UNAUTHORIZED, messages.FORBIDDEN);
    return;
  }

  try {
    const decoded = verifyAccessToken(token);
    req.id = decoded.id;

    const user = await userService.findUserById(req.id);
    if (!user) {
      sendError(res, HttpStatus.NOT_FOUND, messages.NOT_FOUND);
      return;
    }
    next();
  } catch (error: any) {
    console.log(error);
    if (error.name === 'TokenExpiredError') {
      sendError(res, HttpStatus.UNAUTHORIZED, messages.TOKEN_EXPIRED);
      return;
    }
    if (error.name === 'JsonWebTokenError') {
      sendError(res, HttpStatus.UNAUTHORIZED, messages.INVALID_TOKEN);
      return;
    }
    next(error);
  }
};
