import { ZodType, z } from "zod";
import { AppError } from "./app.error";
import { HttpStatus } from "../constants/statusCodes";

export function validate<T extends ZodType<any, any>>(
  schema: T,
  data: unknown
): z.infer<T> {
  const result = schema.safeParse(data);

  if (!result.success) {
    const errorMessages = result.error.issues
      .map((err) => err.message)
      .join(", ");

    throw new AppError(HttpStatus.BAD_REQUEST, errorMessages);
  }

  return result.data;
}
