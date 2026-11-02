import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import { createApp } from './app.ts';
import { buildSeed } from './seed.ts';
import { Store } from './store.ts';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const port = Number(process.env.PORT ?? 5101);
const isProduction = process.env.NODE_ENV === 'production';
const dataFile = process.env.LEDGERLY_DATA_FILE || undefined;

const store = new Store(buildSeed(), dataFile);
const app = createApp(store);

if (isProduction) {
  const dist = path.join(root, 'dist');
  app.use(express.static(dist, { index: false, maxAge: '1h' }));
  app.get('/{*path}', (_req, res) => {
    res.sendFile(path.join(dist, 'index.html'));
  });
} else {
  const { createServer } = await import('vite');
  const vite = await createServer({ root, server: { middlewareMode: true }, appType: 'spa' });
  app.use(vite.middlewares);
}

app.listen(port, () => {
  const mode = isProduction ? 'production' : 'development';
  console.log(`Ledgerly listening on http://localhost:${port} (${mode})`);
});
