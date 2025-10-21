export const messages = {
  // General
  SERVER_ERROR: 'Something went wrong on our end. Please try again later.',
  NOT_FOUND: 'The requested resource was not found.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  FORBIDDEN: 'Access to this resource is forbidden.',

  // Validation / Client Errors
  BAD_REQUEST: 'Invalid request. Please check your input.',
  CONFLICT: 'The resource already exists or there is a conflict.',
  UNPROCESSABLE: 'Validation failed. Please check your data.',
  INVALID_LOGIN_CREDENTIALS:'Invalid email or password',
  PASSWORD_NOT_MATCH:'Incorrect current password. Please try again.',
  NOT_ENOUGH_PREF:'Add minimum of one preference',
  NO_FILE_UPLOADED:'No file uploaded',
  // Success messages
  CREATED: 'Resource created successfully.',
  UPDATED: 'Resource updated successfully.',
  DELETED: 'Resource deleted successfully.',
  OK: 'Request completed successfully.',
  EMAIL_VERIFICATION_SUCCESS: 'Email verification success',
  EMAIL_HAS_SEND:'A new verification link has been sent to your email!',
  ACCOUNT_ALREADY_VERIFIED:'Your account is already verified please login',
  ACCOUNT_NOT_VERIFIED:'Your account is already verified please login',
  // Authentication
  LOGIN_SUCCESS: 'Login successful.',
  LOGOUT_SUCCESS: 'Logout successful.',
  TOKEN_EXPIRED: 'Session expired. Please login again.',
  INVALID_TOKEN: 'Invalid token provided.',
  TOKEN_NOTFOUND: 'Session expired. Please login again.',
  DATABASE_OPERATION_FAILED: 'Data base operation failed.',
};
