import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { renderMarkdown } from './renderer.js';
import { renderDirectory } from './directory.js';
import { createWatcher } from './watcher.js';

export interface ServerConfig {
  dir: string;
  port: number;
  open: boolean;
  reload: boolean;
}

const IMAGE_MIME: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.ico': 'image/x-icon',
  '.bmp': 'image/bmp',
};

function send(res: http.ServerResponse, status: number, body: string, contentType = 'text/html; charset=utf-8') {
  res.writeHead(status, { 'Content-Type': contentType });
  res.end(body);
}

function sendFile(res: http.ServerResponse, filePath: string, contentType: string) {
  const buf = fs.readFileSync(filePath);
  res.writeHead(200, { 'Content-Type': contentType });
  res.end(buf);
}

export function startServer(config: ServerConfig): http.Server {
  const baseDir = path.resolve(config.dir);

  if (!fs.existsSync(baseDir) || !fs.statSync(baseDir).isDirectory()) {
    console.error(`[md-sleek] Directory not found: ${baseDir}`);
    process.exit(1);
  }

  const wss = config.reload ? createWatcher(baseDir) : null;

  const server = http.createServer(async (req, res) => {
    try {
      const url = new URL(req.url!, `http://localhost`);
      const pathname = decodeURIComponent(url.pathname);

      // Directory listing
      if (pathname === '/' || pathname === '/index.html') {
        const html = renderDirectory(baseDir, config.reload);
        return send(res, 200, html);
      }

      // Markdown files
      if (pathname.endsWith('.md')) {
        const filePath = path.join(baseDir, pathname);

        // Path traversal protection
        if (!filePath.startsWith(baseDir)) {
          return send(res, 403, 'Forbidden');
        }

        if (!fs.existsSync(filePath)) {
          return send(res, 404, `<h1>404</h1><p>File not found: ${pathname}</p>`);
        }

        const source = fs.readFileSync(filePath, 'utf-8');
        const title = path.basename(filePath, '.md');
        const html = await renderMarkdown(source, { title, liveReload: config.reload });
        return send(res, 200, html);
      }

      // Image files
      const ext = path.extname(pathname).toLowerCase();
      if (ext in IMAGE_MIME) {
        const filePath = path.join(baseDir, pathname);

        // Path traversal protection
        if (!filePath.startsWith(baseDir)) {
          return send(res, 403, 'Forbidden');
        }

        if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
          return send(res, 404, `<h1>404</h1><p>File not found: ${pathname}</p>`);
        }

        return sendFile(res, filePath, IMAGE_MIME[ext]);
      }

      // 404 for everything else
      send(res, 404, '<h1>404</h1><p>Not found</p>');
    } catch (err) {
      console.error('[md-sleek] Request error:', err);
      send(res, 500, `<h1>500</h1><p>Internal server error</p>`);
    }
  });

  // WebSocket upgrade for live reload
  if (wss) {
    server.on('upgrade', (req, socket, head) => {
      wss.handleUpgrade(req, socket, head, (ws) => {
        wss.emit('connection', ws, req);
      });
    });
  }

  server.listen(config.port, () => {
    console.log(`\n  md-sleek running at:\n`);
    console.log(`  → http://localhost:${config.port}\n`);
    console.log(`  Serving: ${baseDir}`);
    console.log(`  Live reload: ${config.reload ? 'enabled' : 'disabled'}\n`);

    if (config.open) {
      const cmd = process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start' : 'xdg-open';
      import('node:child_process').then(({ exec }) => {
        exec(`${cmd} http://localhost:${config.port}`);
      });
    }
  });

  return server;
}
