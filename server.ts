import 'dotenv/config';
import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { createSasPayRouter } from './server/saspay-routes.ts';
import { handleSasPayWebhook } from './server/saspay-webhook.ts';

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT || 3000);
  const isProd = process.env.NODE_ENV === 'production';

  app.set('trust proxy', true);

  // CRITICAL: Mount SasPay webhook with raw binary body parser BEFORE express.json()
  // so HMAC-SHA256 verification uses the exact bytes signed by SasPay.
  app.post(
    '/api/saspay/webhook',
    express.raw({ type: '*/*', limit: '1mb' }),
    handleSasPayWebhook,
  );

  // Standard JSON body parsing for all other routes
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', service: 'islam-avec-aboubakar' });
  });

  // SasPay server-side API routes
  app.use('/api/saspay', createSasPayRouter());

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      const indexFile = path.join(distDir, 'index.html');
      if (fs.existsSync(indexFile)) {
        res.sendFile(indexFile);
      } else {
        res.status(404).send('Build output not found. Run npm run build.');
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err instanceof Error ? err.message : err);
  process.exit(1);
});
