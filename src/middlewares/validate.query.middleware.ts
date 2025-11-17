import { z, ZodType } from 'zod';
import { Response, NextFunction } from 'express';
import { ExtendedRequest } from './auth.middleware';
import { validate } from '../utils/validate.zod';

export const validateQuery =
  <T extends ZodType>(schema: T) =>
  (req: ExtendedRequest<any, z.infer<T>>, res: Response, next: NextFunction) => {
    try {
      console.log(req.query);
      const parsed = validate(schema, req.query);
      req.validatedQuery = parsed;
      next();
    } catch (err) {
      next(err);
    }
  };