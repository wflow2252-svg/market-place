const { PrismaClient } = require('@prisma/client');

// Final secure connection string with pgbouncer for Vercel Serverless
const DATABASE_URL = process.env.DATABASE_URL;

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: DATABASE_URL,
    },
  },
});

module.exports = prisma;
