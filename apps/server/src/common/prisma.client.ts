import { getErrorMessage } from '@/utils/error-message.util';
import { PrismaClient } from '@prisma/client/extension';

const prisma = new PrismaClient();

// Log when successfully connected
prisma.$on('connect', () => {
  console.log('Successfully connected to the database.');
});

// Log when an error occurs
prisma.$on('error', (error: Error) => {
  console.error('Database error:', error);
});

// Middleware for logging errors
prisma.$use(async (params: any, next: any) => {
  try {
    return await next(params);
  } catch (error) {
    console.error('Database error:', error);
    throw getErrorMessage(error); // Re-throw the error for further handling
  }
});

export default prisma;
