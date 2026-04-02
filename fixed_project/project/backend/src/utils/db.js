const { PrismaClient } = require('@prisma/client');

// ✅ لا passwords في الكود - بس من environment variables
if (!process.env.DATABASE_URL) {
  console.error('[DB Error]: DATABASE_URL is not set in environment variables!');
}

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  log: process.env.NODE_ENV === 'development' ? ['query', 'error'] : ['error'],
});

module.exports = prisma;
