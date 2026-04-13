import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { prisma } from '../services/db';

export async function authRoutes(server: FastifyInstance) {
  // Register a new user
  server.post('/register', async (request, reply) => {
    const registerSchema = z.object({
      email: z.string().email(),
      password: z.string().min(6),
      name: z.string().min(2),
    });

    const body = registerSchema.parse(request.body);

    const exists = await prisma.user.findUnique({
      where: { email: body.email }
    });

    if (exists) {
      return reply.status(400).send({ error: 'E-mail já cadastrado.' });
    }

    const hashedPassword = await bcrypt.hash(body.password, 10);

    const user = await prisma.user.create({
      data: {
        email: body.email,
        password: hashedPassword,
        name: body.name,
        salary: 0, // Initial salary
      }
    });

    const token = server.jwt.sign({ userId: user.id, email: user.email });

    reply
      .setCookie('token', token, {
        path: '/',
        secure: false, // Changed to false for localhost/HTTP development
        httpOnly: true,
        sameSite: 'lax',
      })
      .status(201)
      .send({ success: true, user: { id: user.id, name: user.name, email: user.email } });
  });

  // Login
  server.post('/login', async (request, reply) => {
    const loginSchema = z.object({
      email: z.string().email(),
      password: z.string(),
    });

    const body = loginSchema.parse(request.body);

    const user = await prisma.user.findUnique({
      where: { email: body.email }
    });

    if (!user) {
      return reply.status(401).send({ error: 'Credenciais inválidas.' });
    }

    const match = await bcrypt.compare(body.password, user.password);
    if (!match) {
      return reply.status(401).send({ error: 'Credenciais inválidas.' });
    }

    const token = server.jwt.sign({ userId: user.id, email: user.email });

    reply
      .setCookie('token', token, {
        path: '/',
        secure: false, // Changed to false for localhost/HTTP development
        httpOnly: true,
        sameSite: 'lax',
      })
      .send({ success: true, user: { id: user.id, name: user.name, email: user.email } });
  });

  // Logout
  server.post('/logout', async (request, reply) => {
    reply
      .clearCookie('token', { path: '/' })
      .send({ success: true });
  });
}
