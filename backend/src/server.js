import http from 'http';
import path from 'path';
import fs from 'fs';
import { router } from './routes/index.js';
import { startAutomatedReminderScheduler } from './services/notificationService.js';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 5000;
const isProd = process.env.NODE_ENV === 'production';

async function startServer() {
  let vite = null;

  // Vite only runs locally during development
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');

    vite = await createViteServer({
      server: {
        middlewareMode: true
      },
      appType: 'spa'
    });
  }

  const server = http.createServer((req, res) => {

    // API routes
    if (req.url.startsWith('/api')) {
      return router(req, res);
    }

    // Development: Vite middleware
    if (vite) {
      return vite.middlewares(req, res);
    }

    // Production: serve React build
    const distPath = path.join(process.cwd(), 'dist');

    let filePath = path.join(
      distPath,
      req.url === '/' ? 'index.html' : req.url
    );

    // React SPA fallback
    if (
      !fs.existsSync(filePath) ||
      fs.statSync(filePath).isDirectory()
    ) {
      filePath = path.join(distPath, 'index.html');
    }

    fs.readFile(filePath, (err, data) => {
      if (err) {
        console.error('Error loading file:', err);

        res.writeHead(500, {
          'Content-Type': 'text/plain'
        });

        res.end('Error loading application');
        return;
      }

      const ext = path.extname(filePath);

      const contentTypes = {
        '.html': 'text/html',
        '.js': 'application/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.svg': 'image/svg+xml',
        '.ico': 'image/x-icon',
        '.woff': 'font/woff',
        '.woff2': 'font/woff2'
      };

      const contentType =
        contentTypes[ext] || 'application/octet-stream';

      res.writeHead(200, {
        'Content-Type': contentType
      });

      res.end(data);
    });
  });

  server.listen(PORT, '0.0.0.0', () => {
    console.log(
      `[Hospital System Server] Running on port ${PORT}`
    );

    // Start reminder scheduler
    startAutomatedReminderScheduler();
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});