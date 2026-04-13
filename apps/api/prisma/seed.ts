import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create or update the mock user
  const user = await prisma.user.upsert({
    where: { email: 'fernando@email.com' },
    update: {},
    create: {
      email: 'fernando@email.com',
      name: 'Fernando',
      salary: 15000,
      onboardingDone: true,
      onboardingStep: 0,
      
      transactions: {
        create: [
          {
            amount: 459.90,
            description: 'Shopping Iguatemi',
            category: 'Vestuário',
            type: 'EXPENSE',
            date: new Date(Date.now() - 86400000), // Yesterday
          },
          {
            amount: 890.00,
            description: 'D.O.M Restaurante',
            category: 'Gastronomia',
            type: 'EXPENSE',
            date: new Date(Date.now() - 2 * 86400000),
          },
          {
            amount: 124.50,
            description: 'Dividendos Apple Inc',
            category: 'Investimentos',
            type: 'INCOME',
            date: new Date(Date.now() - 4 * 86400000),
          }
        ]
      },

      goals: {
        create: [
          {
            title: 'Viagem: Japão',
            targetAmount: 15000,
            currentAmount: 12000,
            deadline: new Date('2026-10-05T00:00:00Z'),
          },
          {
            title: 'Reserva de Emergência',
            targetAmount: 50000,
            currentAmount: 22500,
            deadline: new Date('2027-12-01T00:00:00Z'),
          }
        ]
      }
    },
  });

  console.log('Database seeded with user:', user.name);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
