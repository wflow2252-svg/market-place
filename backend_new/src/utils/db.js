const { PrismaClient } = require('@prisma/client');

// ✅ الحل الصح لـ Prisma v7+ على Vercel Serverless
// الـ DATABASE_URL بيتاخد تلقائياً من env - مش محتاج نمرره يدوي
if (!process.env.DATABASE_URL) {
  console.error('[DB Error]: DATABASE_URL is not set!');
}

let prisma;

// ✅ Singleton pattern - مهم على Vercel عشان ميعملش connections كتير
if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  if (!global._prisma) {
    global._prisma = new PrismaClient({ log: ['error'] });
  }
  prisma = global._prisma;
}

module.exports = prisma;
