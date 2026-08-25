import Fastify from 'fastify';
import cors from '@fastify/cors';
import multipart from '@fastify/multipart';

import userRoutes from './routes/users';
import documentRoutes from './routes/documents';
import uploadRoutes from './routes/upload';

export const buildApp = () => {
  const app = Fastify({ logger: true });

  app.register(cors, { 
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-user-id']
  });
  app.register(multipart, {
    limits: {
      fileSize: 10 * 1024 * 1024 // 10MB
    }
  });

  app.register(userRoutes, { prefix: '/api' });
  app.register(documentRoutes, { prefix: '/api' });
  app.register(uploadRoutes, { prefix: '/api' });

  return app;
};
