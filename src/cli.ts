import path from 'node:path';
import { startServer } from './server.js';

const args = process.argv.slice(2);

if (args.includes('-h') || args.includes('--help')) {
  console.log(`
  md-serve - Serve markdown files as beautiful HTML pages

  Usage:
    md-serve [directory] [options]

  Arguments:
    directory          Path to markdown directory (default: ".")

  Options:
    -p, --port <num>   Port number (default: 3000)
    -o, --open         Open browser on start
    --no-reload        Disable live reload
    -h, --help         Show help
    -v, --version      Show version
`);
  process.exit(0);
}

if (args.includes('-v') || args.includes('--version')) {
  console.log('md-serve 1.0.0');
  process.exit(0);
}

const config = { dir: '.', port: 3000, open: false, reload: true };

for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  if (arg === '-p' || arg === '--port') {
    config.port = parseInt(args[++i], 10);
    if (isNaN(config.port)) {
      console.error('Invalid port number');
      process.exit(1);
    }
  } else if (arg === '-o' || arg === '--open') {
    config.open = true;
  } else if (arg === '--no-reload') {
    config.reload = false;
  } else if (!arg.startsWith('-')) {
    config.dir = arg;
  }
}

config.dir = path.resolve(config.dir);

startServer(config);
