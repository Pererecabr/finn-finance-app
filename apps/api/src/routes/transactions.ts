import { FastifyInstance } from 'fastify';
import { prisma } from '../services/db';
import { z } from 'zod';

export async function transactionRoutes(server: FastifyInstance) {
  // Add authentication hook to all routes in this plugin
  server.addHook('preHandler', async (request, reply) => {
    await (server as any).authenticate(request, reply);
  });

  // Get main transactions for the authenticated user
  server.get('/', async (request, reply) => {
    const { userId } = (request as any).user;

    const transactions = await prisma.transaction.findMany({
      where: { userId },
      orderBy: { date: 'desc' }
    });

    return transactions;
  });

  // Create a new transaction manually
  server.post('/', async (request, reply) => {
    const { userId } = (request as any).user;
    
    const createSchema = z.object({
      amount: z.number(),
      description: z.string(),
      category: z.string(),
      type: z.enum(['INCOME', 'EXPENSE'])
    });

    const parsed = createSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Invalid data', details: parsed.error });
    }

    const transaction = await prisma.transaction.create({
      data: {
        ...parsed.data,
        userId: userId,
      }
    });

    return reply.status(201).send(transaction);
  });
}
