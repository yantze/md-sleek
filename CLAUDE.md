# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## md-sleek Package

### Build & Run

```bash
cd md-sleek
npm run build          # tsup → dist/cli.js + dist/index.js + dist/index.d.ts
npm run dev            # tsup --watch (rebuild on source changes)
node dist/cli.js ..    # Serve parent docs directory on port 3000
node dist/cli.js .. -p 8080 -o   # Custom port + auto-open browser
```

### Architecture

The rendering pipeline flows: **cli.ts → server.ts → renderer.ts → template.ts**

- **server.ts** — Node `http` server. Routes: `/` → directory listing, `/*.md` → rendered HTML. WebSocket upgrade shares the HTTP port for live reload.
- **renderer.ts** — Core module. Uses `marked` with a custom `renderer.code()` that intercepts `lang === 'mermaid'` blocks and calls `beautiful-mermaid`'s `renderMermaidSVG()` for sync server-side SVG rendering. Each diagram has independent error handling. Non-mermaid code blocks go through `highlight.js`.
- **template.ts** — HTML shell with all CSS inlined (CSS variables for dark/light mode via `prefers-color-scheme`). Injects the WebSocket live-reload client script.
- **watcher.ts** — `chokidar` watches `**/*.md` with `awaitWriteFinish` debouncing, broadcasts changes via WebSocket to trigger browser reload.
- **directory.ts** — Recursively scans for `.md` files, renders a listing page sorted by modification time.

### tsup Build Config

Two separate tsup entries: `cli.ts` gets the `#!/usr/bin/env node` shebang banner; `index.ts` gets `.d.ts` generation. Both are ESM-only targeting Node 18.

### Key Dependencies

- `beautiful-mermaid` — Sync SSR mermaid rendering (no DOM/browser needed)
- `marked` + `marked-highlight` + `highlight.js` — Markdown parsing and code highlighting
- `chokidar` + `ws` — File watching and WebSocket live reload
