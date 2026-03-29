const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
try {
  const prisma = new PrismaClient({ log: ['info'] });
  console.log("Success with log");
} catch(e) {
  fs.writeFileSync('error3.txt', String(e) + '\n' + e.stack);
}
