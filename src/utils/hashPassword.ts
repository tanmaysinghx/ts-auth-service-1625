import bcrypt from 'bcrypt';

export const hashPassword = async (password: string) => {
  const saltRounds = 10; // You can adjust this value depending on security requirements
  return await bcrypt.hash(password, saltRounds);
};

export const comparePassword = async (password: string, hashedPassword: string) => {
  return await bcrypt.compare(password, hashedPassword);
};
