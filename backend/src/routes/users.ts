import { FastifyPluginAsync } from 'fastify';
import { prisma } from '../../packages/db';

const userRoutes: FastifyPluginAsync = async (server) => {
  server.get('/users', async (request, reply) => {
    const defaultUsers = ['TestUser1', 'TestUser2'];
    for (const username of defaultUsers) {
      await prisma.user.upsert({
        where: { username },
        update: {},
        create: { username },
      });
    }

    const users = await prisma.user.findMany();
    return reply.send(users);
  });

  server.post('/users', async (request, reply) => {
    const { username } = request.body as { username: string };
    if (!username) return reply.status(400).send({ error: 'Username required' });
    
    const user = await prisma.user.upsert({
      where: { username },
      update: {},
      create: { username }
    });
    return reply.send(user);
  });

  server.delete('/users/:id', async (request, reply) => {
    const { id } = request.params as { id: string };

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return reply.status(404).send({ error: 'Not found' });

    await prisma.sharedDocument.deleteMany({ where: { userId: id } });
    
    const docs = await prisma.document.findMany({ where: { ownerId: id } });
    for (const d of docs) {
      await prisma.sharedDocument.deleteMany({ where: { documentId: d.id } });
    }
    await prisma.document.deleteMany({ where: { ownerId: id } });
    
    await prisma.user.delete({ where: { id } });
    return reply.send({ success: true });
  });
};

export default userRoutes;
