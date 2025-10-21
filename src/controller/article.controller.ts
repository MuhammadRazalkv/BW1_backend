import { NextFunction, Request, Response } from 'express';
import { validate } from '../utils/validate.zod';
import { articleSchema } from '../dto/article.dto';
import { ExtendedRequest } from '../middlewares/auth.middleware';
import { messages } from '../constants/httpStatusMessages';
import { HttpStatus } from '../constants/statusCodes';
import { AppError } from '../utils/app.error';
import { newArticle } from '../service/article.service';
import { sendSuccess } from '../utils/response.util';
export const createArticle = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.id;
    if (!userId) {
      throw new AppError(HttpStatus.BAD_REQUEST, messages.TOKEN_NOTFOUND);
    }
    const data = validate(articleSchema, req.body);
    if (data.image && !req.file) {
      throw new AppError(HttpStatus.BAD_REQUEST, messages.NO_FILE_UPLOADED);
    }
    const fileUrl = req.file?.path;
    const updateData = { ...data, image: fileUrl };
    await newArticle(userId, updateData);
    console.log('sending success');
    
    sendSuccess(res, HttpStatus.CREATED, {}, messages.CREATED);
  } catch (error) {
    next(error);
  }
};
