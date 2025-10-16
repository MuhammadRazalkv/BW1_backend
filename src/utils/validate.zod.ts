import { ZodType } from "zod";
import { AppError } from "./app.error";
import { HttpStatus } from "../constants/statusCodes";

export function validate<T>(schema: ZodType<T>, data: unknown): T {
  const result = schema.safeParse(data);

  if (!result.success) {
    const errorMessages = result.error.issues.map((err) => err.message).join(', ');
    console.log('Error msg', result.error);

    throw new AppError(HttpStatus.BAD_REQUEST, errorMessages);
  }

  return result.data;
}