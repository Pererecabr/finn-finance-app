import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.upsert({
    where: { email: 'onboarding@example.com' },
    update: {
      onboardingDone: false,
      onboardingStep: 0,
      salary: 0,
    },
    create: {
      email: 'onboarding@example.com',
      name: 'Novo Usuário',
      salary: 0,
      onboardingDone: false,
      onboardingStep: 0,
    },
  });

  console.log('User created for onboarding test:', user.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
