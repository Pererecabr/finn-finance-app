import fastify from 'fastify';
import cors from '@fastify/cors';
import cookie from '@fastify/cookie';
import jwt from '@fastify/jwt';
import { transactionRoutes } from './routes/transactions';
import { goalRoutes } from './routes/goals';
import { chatRoutes } from './routes/chat';
import { authRoutes } from './routes/auth';
import { serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod';
import { prisma } from './services/db';
import { z } from 'zod';

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: any;
  }
}

const server = fastify({ logger: true });

// Plugins configuration
server.register(cookie);
server.register(jwt, {
  secret: process.env.JWT_SECRET || 'fallback-secret-development',
  cookie: {
    cookieName: 'token',
    signed: false,
  },
});

// Setup Zod globally for validation
server.setValidatorCompiler(validatorCompiler);
server.setSerializerCompiler(serializerCompiler);

server.register(cors, {
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'PUT', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
});

// App Routes
server.register(authRoutes, { prefix: '/api/auth' });
server.register(transactionRoutes, { prefix: '/api/transactions' });
server.register(goalRoutes, { prefix: '/api/goals' });
server.register(chatRoutes, { prefix: '/api/chat' });

// Decorator to protect routes
server.decorate('authenticate', async (request: any, reply: any) => {
  try {
    const token = request.cookies.token;
    if (!token) throw new Error('No token provided');
    
    // Manual verification since we are using cookies
    const decoded = await server.jwt.verify(token);
    request.user = decoded; 
  } catch (err) {
    reply.status(401).send({ error: 'Não autorizado. Faça login novamente.' });
  }
});

// Get current user status
server.get('/api/me', {
  preHandler: [server.authenticate]
}, async (request, reply) => {
  const { userId } = (request as any).user;
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });
  return user;
});

// Update user profile
server.patch('/api/me', {
  preHandler: [server.authenticate]
}, async (request, reply) => {
  const { userId } = (request as any).user;
  
  const updateSchema = z.object({
    name: z.string().min(2).optional(),
    salary: z.number().optional(),
    geminiKey: z.string().min(10).optional(),
  });

  const parsed = updateSchema.safeParse(request.body);
  if (!parsed.success) {
    return reply.status(400).send({ error: 'Dados inválidos', details: parsed.error });
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: parsed.data
  });

  return { success: true, user: { id: user.id, name: user.name, email: user.email } };
});

// Health check
server.get('/health', async () => {
  return { status: 'ok', timestamp: new Date().toISOString() };
});

const start = async () => {
  try {
    await server.listen({ port: 3001, host: '0.0.0.0' });
    console.log(`Server is running at http://localhost:3001`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
