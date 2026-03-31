const { PrismaClient } = require('@prisma/client');

// Final secure connection string with pgbouncer for Vercel Serverless
const DATABASE_URL = process.env.DATABASE_URL || "postgresql://postgres.ivmcopyntmrcvvddzrye:Code2252_2252@aws-0-eu-north-1.pooler.supabase.com:6543/postgres?pgbouncer=true";

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: DATABASE_URL,
    },
  },
});

module.exports = prisma;
