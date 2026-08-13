import http from 'http';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { router } from './routes/index.js';
import { startAutomatedReminderScheduler } from './services/notificationService.js';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 3000;
const isProd = process.env.NODE_ENV === 'production';

async function startServer() {
  let vite = null;
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
  }

  const server = http.createServer((req, res) => {
    // 1. API routes
    if (req.url.startsWith('/api')) {
      return router(req, res);
    }

    // 2. Vite Dev Server Middleware or Static Production File Server
    if (vite) {
      vite.middlewares(req, res);
    } else {
      // Production static file fallback
      const distPath = path.join(process.cwd(), 'dist');
      let filePath = path.join(distPath, req.url === '/' ? 'index.html' : req.url);

      if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
        filePath = path.join(distPath, 'index.html');
      }

      fs.readFile(filePath, (err, data) => {
        if (err) {
          res.writeHead(500);
          res.end('Error loading application');
          return;
        }
        const ext = path.extname(filePath);
        let contentType = 'text/html';
        if (ext === '.js') contentType = 'application/javascript';
        if (ext === '.css') contentType = 'text/css';
        if (ext === '.json') contentType = 'application/json';
        if (ext === '.png') contentType = 'image/png';
        if (ext === '.svg') contentType = 'image/svg+xml';

        res.writeHead(200, { 'Content-Type': contentType });
        res.end(data);
      });
    }
  });

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`[Hospital System Server] Running on http://0.0.0.0:${PORT}`);
    // Start automated 24-Hour appointment reminder scheduler background job
    startAutomatedReminderScheduler();
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});
