import bcrypt from 'bcrypt';

export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

export const comparePassword = (enteredPassword: string, storedPassword: string) => {
  const isPasswordMatch = bcrypt.compare(enteredPassword, storedPassword);
  return isPasswordMatch;
};
