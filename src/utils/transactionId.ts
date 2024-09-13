import { v4 as uuidv4 } from 'uuid';

export const generateTransactionId = (): string => {
  return uuidv4();
};
