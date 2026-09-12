import { PrismaClient } from '@prisma/client';

// Singleton Prisma client để tránh tạo nhiều kết nối
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error'] : ['error'],
});

export default prisma;
