require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  try {
    const user = await prisma.user.findFirst();
    console.log("SUCCESS:", user);
  } catch (e) {
    console.error("PRISMA_ERROR:", e.message);
  } finally {
    await prisma.$disconnect();
  }
}

test();
