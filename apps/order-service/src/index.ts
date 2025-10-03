import Fastify from 'fastify';
import cors from '@fastify/cors';
import Clerk from '@clerk/fastify';
import { shouldBeUser } from './middleware/authmiddleware.js';

const fastify = Fastify();

// Enable CORS
fastify.register(cors, {
  origin: ['http://localhost:3000', 'http://localhost:3002', 'http://localhost:3003'],
  credentials: true,
});

fastify.register(Clerk.clerkPlugin);

fastify.get('/health', (request, reply) => {
  return reply.status(200).send({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: Date.now(),
  });
});

fastify.get('/test', { preHandler: shouldBeUser }, (request, reply) => {
  return reply.send({ message: 'Order service authenticated', userId: request.userId });
});

const start = async () => {
  try {
    await fastify.listen({ port: 8001 });
    console.log('Order service is running on port 8001');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
