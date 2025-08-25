import { extname } from 'path';

export const generateRandomFilename = (originalname: string): string => {
  const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
  return `${randomName}${extname(originalname)}`;
};
