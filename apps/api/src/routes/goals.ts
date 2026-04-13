import { FastifyInstance } from 'fastify';
import { prisma } from '../services/db';

export async function goalRoutes(server: FastifyInstance) {
  // Add authentication hook
  server.addHook('preHandler', async (request, reply) => {
    await (server as any).authenticate(request, reply);
  });

  server.get('/', async (request, reply) => {
    const { userId } = (request as any).user;
    
    const goals = await prisma.goal.findMany({
      where: { userId }
    });
    return goals;
  });
}
