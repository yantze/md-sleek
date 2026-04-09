import chokidar from 'chokidar';
import { WebSocketServer, WebSocket } from 'ws';

export function createWatcher(dir: string): WebSocketServer {
  const wss = new WebSocketServer({ noServer: true });

  const watcher = chokidar.watch('**/*.md', {
    cwd: dir,
    ignoreInitial: true,
    awaitWriteFinish: { stabilityThreshold: 150, pollInterval: 50 },
  });

  watcher.on('all', (_event: string, filePath: string) => {
    const message = JSON.stringify({ type: 'reload', file: filePath, event: _event });
    for (const client of wss.clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    }
  });

  return wss;
}
