import { z, ZodType } from 'zod';
import { Response, NextFunction } from 'express';

import { ExtendedRequest } from './auth.middleware';
import { validate } from '../utils/validate.zod';

export const validateBody =
  <T extends ZodType>(schema: T) =>
  (req: ExtendedRequest<z.infer<T>>, res: Response, next: NextFunction) => {
    try {
      console.log(req.body);

      const parsed = validate(schema, req.body);
      req.validatedBody = parsed;
      next();
    } catch (err) {
      next(err);
    }
  };
