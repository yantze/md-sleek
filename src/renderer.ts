import { Marked } from 'marked';
import { markedHighlight } from 'marked-highlight';
import hljs from 'highlight.js';
import { wrapInTemplate, escapeHtml } from './template.js';

let renderMermaidSVG: ((code: string) => string) | null = null;

async function loadMermaid() {
  if (renderMermaidSVG) return;
  try {
    const mod = await import('beautiful-mermaid');
    renderMermaidSVG = mod.renderMermaidSVG;
  } catch {
    console.warn('[md-sleek] beautiful-mermaid not available, mermaid diagrams will show as code blocks');
  }
}

function createMarked(): Marked {
  const marked = new Marked();

  marked.use(
    markedHighlight({
      langPrefix: 'hljs language-',
      highlight(code: string, lang: string) {
        if (lang === 'mermaid') return code;
        if (lang && hljs.getLanguage(lang)) {
          return hljs.highlight(code, { language: lang }).value;
        }
        return hljs.highlightAuto(code).value;
      },
    })
  );

  marked.use({
    renderer: {
      code({ text, lang }: { text: string; lang?: string | null }) {
        if (lang === 'mermaid' && renderMermaidSVG) {
          try {
            const svg = renderMermaidSVG(text);
            return `<div class="mermaid-diagram">${svg}</div>`;
          } catch (err) {
            return `<div class="mermaid-error">
  <p class="mermaid-error-msg">Diagram render failed: ${escapeHtml(String(err))}</p>
  <pre><code>${escapeHtml(text)}</code></pre>
</div>`;
          }
        }
        return false as unknown as string;
      },
    },
  });

  return marked;
}

export async function renderMarkdown(
  source: string,
  opts: { title: string; liveReload?: boolean }
): Promise<string> {
  await loadMermaid();
  const marked = createMarked();
  const bodyHtml = await marked.parse(source);
  return wrapInTemplate(bodyHtml, opts.title, opts.liveReload ?? true);
}
