import { FastifyPluginAsync } from 'fastify';
import mammoth from 'mammoth';

const uploadRoutes: FastifyPluginAsync = async (server) => {
  server.post('/upload', async (request, reply) => {
    const data = await request.file();
    if (!data) return reply.status(400).send({ error: 'No file uploaded' });

    const buffer = await data.toBuffer();
    let text = '';
    const filename = data.filename;

    if (filename.endsWith('.docx')) {
      const result = await mammoth.extractRawText({ buffer });
      text = result.value;
    } else {
      text = buffer.toString('utf-8');
    }

    const htmlContent = text.split('\n').map(line => `<p>${line}</p>`).join('');

    return reply.send({ title: filename, content: htmlContent });
  });
};

export default uploadRoutes;
