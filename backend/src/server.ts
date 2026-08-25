import { buildApp } from './app';

const start = async () => {
  const app = buildApp();
  try {
    const port = process.env.PORT ? parseInt(process.env.PORT) : 3001;
    await app.listen({ port, host: '0.0.0.0' });
    console.log(`Server running on http://0.0.0.0:${port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
