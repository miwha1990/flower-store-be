import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();
const roundsOfHashing = 10;

async function main() {
  const password = await hash('password123', roundsOfHashing);
  await prisma.user.upsert({
    where: { email: 'admin@admin.com' },
    update: {
      password: password,
    },
    create: {
      email: 'admin@admin.com',
      name: 'Admin',
      type: 'owner',
      password,
    },
  });
}
main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
