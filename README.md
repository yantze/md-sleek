# md-serve

Serve markdown files as beautiful HTML pages with live reload and Mermaid diagram support.

Zero config. Just point it at a directory.

## Features

- GitHub-flavored styling with light/dark mode (follows system preference)
- Syntax highlighting via [highlight.js](https://highlightjs.org/)
- Mermaid diagrams rendered as SVG via [beautiful-mermaid](https://www.npmjs.com/package/beautiful-mermaid)
- Live reload on file changes
- Directory listing sorted by last modified
- No client-side JavaScript frameworks — pure HTML/CSS

## Install

```bash
npm install -g md-serve
```

## Usage

```bash
# Serve current directory
md-serve

# Serve a specific directory
md-serve ./docs

# Custom port
md-serve -p 8080

# Open browser on start
md-serve -o

# Disable live reload
md-serve --no-reload

# Combine options
md-serve ./docs -p 4000 -o
```

Open `http://localhost:3000` to see the directory listing, click any `.md` file to view it.

## Programmatic API

```ts
import { startServer, renderMarkdown } from 'md-serve';

// Start a server
const server = startServer({
  dir: './docs',
  port: 3000,
  open: false,
  reload: true,
});

// Or just render markdown to HTML
const html = await renderMarkdown('# Hello\n\nWorld', {
  title: 'Hello',
  liveReload: false,
});
```

## CLI Options

| Option | Description | Default |
|---|---|---|
| `[directory]` | Path to markdown directory | `.` |
| `-p, --port <num>` | Port number | `3000` |
| `-o, --open` | Open browser on start | `false` |
| `--no-reload` | Disable live reload | `false` |
| `-h, --help` | Show help | |
| `-v, --version` | Show version | |

## Requirements

Node.js >= 18.17.0

## License

MIT
