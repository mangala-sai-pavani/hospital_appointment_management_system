import http from 'http';
import path from 'path';
import fs from 'fs';
import { router } from './routes/index.js';
import { startAutomatedReminderScheduler } from './services/notificationService.js';
import dotenv from 'dotenv';

dotenv.config();

const PORT = Number(process.env.PORT) || 5000;
const isProd = process.env.NODE_ENV === 'production';

async function startServer() {
let vite = null;

// Vite is only used during local development
if (!isProd) {
const { createServer: createViteServer } = await import('vite');

```
vite = await createViteServer({
  server: {
    middlewareMode: true
  },
  appType: 'spa'
});
```

}

const server = http.createServer((req, res) => {
// --------------------------------------------------------
// API ROUTES
// --------------------------------------------------------

```
if (req.url?.startsWith('/api')) {
  return router(req, res);
}

// --------------------------------------------------------
// DEVELOPMENT - VITE
// --------------------------------------------------------

if (vite) {
  return vite.middlewares(req, res);
}

// --------------------------------------------------------
// PRODUCTION - SERVE FRONTEND
// --------------------------------------------------------

const distPath = path.join(process.cwd(), 'dist');

let requestedPath = req.url || '/';

// Remove query parameters
requestedPath = requestedPath.split('?')[0];

let filePath = path.join(
  distPath,
  requestedPath === '/' ? 'index.html' : requestedPath
);

// Prevent invalid file paths
if (
  !fs.existsSync(filePath) ||
  fs.statSync(filePath).isDirectory()
) {
  filePath = path.join(distPath, 'index.html');
}

fs.readFile(filePath, (err, data) => {
  if (err) {
    console.error('Static file error:', err);

    res.writeHead(500, {
      'Content-Type': 'text/plain'
    });

    return res.end('Error loading application');
  }

  const ext = path.extname(filePath).toLowerCase();

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
    '.webp': 'image/webp'
  };

  const contentType =
    contentTypes[ext] || 'application/octet-stream';

  res.writeHead(200, {
    'Content-Type': contentType
  });

  res.end(data);
});
```

});

// --------------------------------------------------------
// START SERVER
// --------------------------------------------------------

server.listen(PORT, '0.0.0.0', () => {
console.log(
`[Hospital System Server] Running on port ${PORT}`
);

```
console.log(
  `[Hospital System Server] Environment: ${
    isProd ? 'production' : 'development'
  }`
);

// Start automated 24-hour appointment reminder scheduler
startAutomatedReminderScheduler();
```

});
}

// ------------------------------------------------------------
// START APPLICATION
// ------------------------------------------------------------

startServer().catch(error => {
console.error(
'[Hospital System Server] Failed to start:',
error
);

process.exit(1);
});
