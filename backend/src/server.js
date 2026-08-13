
import http from 'http';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

import { router } from './routes/index.js';
import { startAutomatedReminderScheduler } from './services/notificationService.js';

dotenv.config();

// ============================================================
// SERVER CONFIGURATION
// ============================================================

const PORT = Number(process.env.PORT) || 5000;
const isProd = process.env.NODE_ENV === 'production';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================================
// MIME TYPES
// ============================================================

const mimeTypes = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.mjs': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf'
};

// ============================================================
// STATIC FILE SERVER
// ============================================================

function serveStaticFile(req, res) {
  const distPath = path.join(process.cwd(), 'dist');

  // Remove query string
  const requestPath = (req.url || '/').split('?')[0];

  // Prevent directory traversal
  const safePath = path.normalize(requestPath).replace(/^(\.\.[/\\])+/, '');

  let filePath = path.join(
    distPath,
    safePath === '/' ? 'index.html' : safePath
  );

  // If requested file doesn't exist, serve React's index.html
  // This allows React Router routes to work in production.
  if (
    !fs.existsSync(filePath) ||
    fs.statSync(filePath).isDirectory()
  ) {
    filePath = path.join(distPath, 'index.html');
  }

  fs.readFile(filePath, (error, data) => {
    if (error) {
      console.error(
        '[Server] Failed to serve static file:',
        error.message
      );

      res.writeHead(500, {
        'Content-Type': 'text/plain'
      });

      res.end('Error loading application');
      return;
    }

    const extension = path.extname(filePath).toLowerCase();
    const contentType =
      mimeTypes[extension] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType
    });

    res.end(data);
  });
}

// ============================================================
// HTTP SERVER
// ============================================================

async function startServer() {
  let vite = null;

  // Vite is only used during local development.
  if (!isProd) {
    try {
      const { createServer: createViteServer } =
        await import('vite');

      vite = await createViteServer({
        server: {
          middlewareMode: true
        },
        appType: 'spa'
      });

      console.log('[Server] Vite development middleware enabled.');
    } catch (error) {
      console.error(
        '[Server] Failed to start Vite:',
        error.message
      );
    }
  }

  const server = http.createServer(async (req, res) => {
    try {
      const requestUrl = req.url || '/';

      // --------------------------------------------------------
      // HEALTH CHECK
      // --------------------------------------------------------

      if (requestUrl === '/health') {
        res.writeHead(200, {
          'Content-Type': 'application/json'
        });

        res.end(
          JSON.stringify({
            status: 'ok',
            environment: isProd
              ? 'production'
              : 'development',
            timestamp: new Date().toISOString()
          })
        );

        return;
      }

      // --------------------------------------------------------
      // API ROUTES
      // --------------------------------------------------------

      if (
        requestUrl === '/api' ||
        requestUrl.startsWith('/api/')
      ) {
        return router(req, res);
      }

      // --------------------------------------------------------
      // DEVELOPMENT - VITE
      // --------------------------------------------------------

      if (vite) {
        return vite.middlewares(req, res);
      }

      // --------------------------------------------------------
      // PRODUCTION - STATIC FRONTEND
      // --------------------------------------------------------

      return serveStaticFile(req, res);

    } catch (error) {
      console.error(
        '[Server] Request error:',
        error
      );

      if (!res.headersSent) {
        res.writeHead(500, {
          'Content-Type': 'application/json'
        });

        res.end(
          JSON.stringify({
            error: 'Internal server error'
          })
        );
      }
    }
  });

  // ==========================================================
  // START SERVER
  // ==========================================================

  server.listen(PORT, '0.0.0.0', () => {
    console.log(
      `[Hospital System Server] Running on 0.0.0.0:${PORT}`
    );

    console.log(
      `[Hospital System Server] Environment: ${
        isProd ? 'production' : 'development'
      }`
    );

    // Start automated 24-hour appointment reminder scheduler.
    try {
      startAutomatedReminderScheduler();

      console.log(
        '[Hospital System Server] 24-hour reminder scheduler started.'
      );
    } catch (error) {
      console.error(
        '[Hospital System Server] Failed to start reminder scheduler:',
        error.message
      );
    }
  });

  // ==========================================================
  // SERVER ERROR HANDLING
  // ==========================================================

  server.on('error', error => {
    console.error(
      '[Hospital System Server] Server error:',
      error
    );

    if (error.code === 'EADDRINUSE') {
      console.error(
        `[Hospital System Server] Port ${PORT} is already in use.`
      );
    }
  });

  // ==========================================================
  // GRACEFUL SHUTDOWN
  // ==========================================================

  const shutdown = signal => {
    console.log(
      `[Hospital System Server] ${signal} received. Shutting down...`
    );

    server.close(() => {
      console.log(
        '[Hospital System Server] Server closed.'
      );

      process.exit(0);
    });

    // Force shutdown if something refuses to close.
    setTimeout(() => {
      console.error(
        '[Hospital System Server] Forced shutdown.'
      );

      process.exit(1);
    }, 10000).unref();
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

// ============================================================
// START APPLICATION
// ============================================================

startServer().catch(error => {
  console.error(
    '[Hospital System Server] Failed to start server:',
    error
  );

  process.exit(1);
});

