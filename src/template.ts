function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const LIVE_RELOAD_SCRIPT = `
(function() {
  var ws = new WebSocket('ws://' + location.host);
  ws.onmessage = function(e) {
    var data = JSON.parse(e.data);
    if (data.type === 'reload') {
      var currentFile = decodeURIComponent(location.pathname.slice(1));
      if (data.file === currentFile || location.pathname === '/' || data.event === 'unlink') {
        location.reload();
      }
    }
  };
  ws.onclose = function() {
    setTimeout(function() { location.reload(); }, 1000);
  };
})();
`;

const CSS = `
:root {
  --bg: #ffffff;
  --fg: #24292f;
  --fg-muted: #656d76;
  --bg-code: #f6f8fa;
  --bg-code-block: #f6f8fa;
  --border: #d0d7de;
  --border-light: #e8eaed;
  --link: #0969da;
  --bg-table-alt: #f6f8fa;
  --mermaid-bg: #f8f9fa;
  --bg-blockquote: #f6f8fa;
  --border-blockquote: #d0d7de;
  --shadow: 0 1px 3px rgba(0,0,0,0.04);
}

@media (prefers-color-scheme: dark) {
  :root {
    --bg: #0d1117;
    --fg: #e6edf3;
    --fg-muted: #8b949e;
    --bg-code: #161b22;
    --bg-code-block: #161b22;
    --border: #30363d;
    --border-light: #21262d;
    --link: #58a6ff;
    --bg-table-alt: #161b22;
    --mermaid-bg: #161b22;
    --bg-blockquote: #161b22;
    --border-blockquote: #30363d;
    --shadow: 0 1px 3px rgba(0,0,0,0.2);
  }
}

*, *::before, *::after { box-sizing: border-box; }

html {
  font-size: 16px;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', Helvetica, Arial, sans-serif;
  max-width: 100%;
  margin: 0;
  padding: 2.5rem 3rem 4rem;
  background: var(--bg);
  color: var(--fg);
  line-height: 1.7;
  word-wrap: break-word;
}

/* Headings */
h1, h2, h3, h4, h5, h6 {
  margin-top: 2rem;
  margin-bottom: 1rem;
  font-weight: 600;
  line-height: 1.3;
}
h1 { font-size: 2rem; border-bottom: 1px solid var(--border); padding-bottom: 0.3rem; }
h2 { font-size: 1.5rem; border-bottom: 1px solid var(--border); padding-bottom: 0.3rem; }
h3 { font-size: 1.25rem; }
h4 { font-size: 1rem; }

/* Links */
a { color: var(--link); text-decoration: none; }
a:hover { text-decoration: underline; }

/* Paragraphs */
p { margin: 0 0 1rem; }

/* Inline code */
code {
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
  font-size: 0.875em;
  background: var(--bg-code);
  padding: 0.2em 0.4em;
  border-radius: 6px;
}

/* Code blocks */
pre {
  background: var(--bg-code-block);
  border: 1px solid var(--border-light);
  border-radius: 8px;
  padding: 1rem;
  overflow-x: auto;
  line-height: 1.5;
  margin: 0 0 1rem;
}
pre code {
  background: none;
  padding: 0;
  border-radius: 0;
  font-size: 0.85rem;
}

/* Blockquotes */
blockquote {
  margin: 0 0 1rem;
  padding: 0.5rem 1rem;
  border-left: 4px solid var(--border-blockquote);
  background: var(--bg-blockquote);
  border-radius: 0 8px 8px 0;
  color: var(--fg-muted);
}
blockquote p:last-child { margin-bottom: 0; }

/* Tables */
table {
  width: 100%;
  border-collapse: collapse;
  margin: 0 0 1rem;
  display: block;
  overflow-x: auto;
}
th, td {
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--border);
  text-align: left;
}
th {
  font-weight: 600;
  background: var(--bg-table-alt);
}
tr:nth-child(even) td { background: var(--bg-table-alt); }

/* Lists */
ul, ol { padding-left: 2em; margin: 0 0 1rem; }
li { margin: 0.25rem 0; }
li > ul, li > ol { margin: 0; }

/* Images */
img { max-width: 100%; height: auto; border-radius: 8px; }

/* Horizontal rule */
hr {
  border: none;
  border-top: 2px solid var(--border);
  margin: 2rem 0;
}

/* Mermaid diagrams */
.mermaid-diagram {
  margin: 1.5rem 0;
  text-align: center;
  overflow-x: auto;
  background: var(--mermaid-bg);
  border: 1px solid var(--border-light);
  border-radius: 8px;
  padding: 1.5rem 1rem;
}
.mermaid-diagram svg {
  max-width: 100%;
  height: auto;
}

.mermaid-error {
  border: 2px solid #d1242f;
  border-radius: 8px;
  padding: 1rem;
  margin: 1.5rem 0;
  background: rgba(209, 36, 47, 0.05);
}
.mermaid-error-msg {
  color: #d1242f;
  font-weight: 600;
  margin: 0 0 0.5rem;
  font-size: 0.875rem;
}
.mermaid-error pre {
  margin: 0;
  font-size: 0.8rem;
}

/* Directory listing */
.file-list {
  list-style: none;
  padding: 0;
}
.file-list li {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  border: 1px solid var(--border-light);
  border-radius: 8px;
  margin: 0.5rem 0;
  transition: border-color 0.15s;
}
.file-list li:hover {
  border-color: var(--link);
}
.file-list a {
  font-weight: 500;
  font-size: 1rem;
}
.file-count {
  color: var(--fg-muted);
  font-size: 0.875rem;
  margin-bottom: 1.5rem;
}
.modified {
  color: var(--fg-muted);
  font-size: 0.8rem;
  white-space: nowrap;
}

/* Responsive */
@media (max-width: 768px) {
  body { padding: 1.5rem 1rem 3rem; }
  h1 { font-size: 1.5rem; }
  h2 { font-size: 1.25rem; }
  pre { font-size: 0.8rem; }
}

/* highlight.js overrides */
.hljs { background: transparent !important; }
`;

export function wrapInTemplate(bodyHtml: string, title: string, liveReload = true): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)}</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.11.1/styles/github.min.css" media="(prefers-color-scheme: light)">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.11.1/styles/github-dark.min.css" media="(prefers-color-scheme: dark)">
  <style>${CSS}</style>
</head>
<body>
  <article>${bodyHtml}</article>
  ${liveReload ? `<script>${LIVE_RELOAD_SCRIPT}</script>` : ''}
</body>
</html>`;
}

export { escapeHtml };
