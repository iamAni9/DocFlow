import { FastifyPluginAsync } from 'fastify';
import { prisma } from '../../packages/db';

const documentRoutes: FastifyPluginAsync = async (server) => {
  server.get('/documents', async (request, reply) => {
    const userId = request.headers['x-user-id'] as string;
    if (!userId) return reply.status(401).send({ error: 'Unauthorized' });

    const ownedDocs = await prisma.document.findMany({
      where: { ownerId: userId },
      orderBy: { updatedAt: 'desc' }
    });

    const sharedDocsRaw = await prisma.sharedDocument.findMany({
      where: { userId },
      include: { document: true },
      orderBy: { document: { updatedAt: 'desc' } }
    });
    const sharedDocs = sharedDocsRaw.map(s => s.document);

    return reply.send({ ownedDocs, sharedDocs });
  });

  server.post('/documents', async (request, reply) => {
    const userId = request.headers['x-user-id'] as string;
    if (!userId) return reply.status(401).send({ error: 'Unauthorized' });

    const { title, content } = request.body as { title: string, content: string };
    const doc = await prisma.document.create({
      data: {
        title,
        content,
        ownerId: userId
      }
    });

    return reply.send(doc);
  });

  server.get('/documents/:id', async (request, reply) => {
    const userId = request.headers['x-user-id'] as string;
    const { id } = request.params as { id: string };

    if (!userId) return reply.status(401).send({ error: 'Unauthorized' });

    const doc = await prisma.document.findUnique({
      where: { id },
      include: { sharedWith: true }
    });

    if (!doc) return reply.status(404).send({ error: 'Not found' });

    const hasAccess = doc.ownerId === userId || doc.sharedWith.some(s => s.userId === userId);
    if (!hasAccess) return reply.status(403).send({ error: 'Forbidden' });

    return reply.send(doc);
  });

  server.put('/documents/:id', async (request, reply) => {
    const userId = request.headers['x-user-id'] as string;
    const { id } = request.params as { id: string };
    
    console.log('PUT /documents/:id body:', request.body);
    
    const { title, content } = request.body as { title?: string, content?: string };

    if (!userId) return reply.status(401).send({ error: 'Unauthorized' });

    const doc = await prisma.document.findUnique({ where: { id }, include: { sharedWith: true } });
    if (!doc) return reply.status(404).send({ error: 'Not found' });

    const hasAccess = doc.ownerId === userId || doc.sharedWith.some(s => s.userId === userId);
    if (!hasAccess) return reply.status(403).send({ error: 'Forbidden' });

    const updatedDoc = await prisma.document.update({
      where: { id },
      data: {
        title: title ?? doc.title,
        content: content ?? doc.content
      }
    });

    return reply.send(updatedDoc);
  });

  server.post('/documents/:id/share', async (request, reply) => {
    const ownerId = request.headers['x-user-id'] as string;
    const { id: documentId } = request.params as { id: string };
    const { username } = request.body as { username: string };

    if (!ownerId) return reply.status(401).send({ error: 'Unauthorized' });

    const doc = await prisma.document.findUnique({ where: { id: documentId } });
    if (!doc) return reply.status(404).send({ error: 'Not found' });
    if (doc.ownerId !== ownerId) return reply.status(403).send({ error: 'Only owner can share' });

    const targetUser = await prisma.user.findUnique({ where: { username } });
    if (!targetUser) return reply.status(404).send({ error: 'User not found' });

    if (targetUser.id === ownerId) return reply.status(400).send({ error: 'Cannot share with yourself' });

    try {
      const sharedDoc = await prisma.sharedDocument.create({
        data: {
          documentId,
          userId: targetUser.id
        }
      });
      return reply.send(sharedDoc);
    } catch (err) {
      return reply.status(400).send({ error: 'Already shared' });
    }
  });

  server.delete('/documents/:id', async (request, reply) => {
    const userId = request.headers['x-user-id'] as string;
    const { id } = request.params as { id: string };

    if (!userId) return reply.status(401).send({ error: 'Unauthorized' });

    const doc = await prisma.document.findUnique({ where: { id } });
    if (!doc) return reply.status(404).send({ error: 'Not found' });
    if (doc.ownerId !== userId) return reply.status(403).send({ error: 'Only owner can delete' });

    await prisma.sharedDocument.deleteMany({ where: { documentId: id } });
    await prisma.document.delete({ where: { id } });

    return reply.send({ success: true });
  });
};

export default documentRoutes;
