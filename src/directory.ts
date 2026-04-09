import fs from 'node:fs';
import path from 'node:path';
import { wrapInTemplate } from './template.js';

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return date.toLocaleDateString();
}

interface FileEntry {
  path: string;
  name: string;
  modified: Date;
  size: number;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(1)} MB`;
}

export function renderDirectory(dir: string, liveReload = true): string {
  const entries: FileEntry[] = [];

  function scan(currentDir: string, prefix: string) {
    const items = fs.readdirSync(currentDir, { withFileTypes: true });
    for (const item of items) {
      if (item.name.startsWith('.')) continue;
      const fullPath = path.join(currentDir, item.name);
      const relPath = prefix ? `${prefix}/${item.name}` : item.name;
      if (item.isDirectory()) {
        scan(fullPath, relPath);
      } else if (item.name.endsWith('.md')) {
        const stat = fs.statSync(fullPath);
        entries.push({
          path: relPath,
          name: item.name,
          modified: stat.mtime,
          size: stat.size,
        });
      }
    }
  }

  scan(dir, '');
  entries.sort((a, b) => b.modified.getTime() - a.modified.getTime());

  const listHtml = entries
    .map(
      (f) =>
        `<li>
  <a href="/${f.path}">${f.path}</a>
  <span class="modified">${formatSize(f.size)} &middot; ${timeAgo(f.modified)}</span>
</li>`
    )
    .join('\n');

  const bodyHtml = `
<h1>Documentation</h1>
<p class="file-count">${entries.length} markdown file${entries.length !== 1 ? 's' : ''}</p>
<ul class="file-list">
${listHtml}
</ul>`;

  return wrapInTemplate(bodyHtml, 'Documentation', liveReload);
}
