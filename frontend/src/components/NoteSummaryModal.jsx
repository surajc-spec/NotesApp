import React, { useState, useEffect } from 'react';
import {
  FileText,
  X,
  Copy,
  Check,
  Loader2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { useAuth } from '../contexts/AuthContext';

/**
 * Render math equation safely using KaTeX
 */
function renderKaTeX(tex, isDisplay = false) {
  try {
    return katex.renderToString(tex, {
      displayMode: isDisplay,
      throwOnError: false,
    });
  } catch {
    return tex;
  }
}

/**
 * Parse inline formatting: math ($...$), bold (**...**), and code (`...`)
 */
function parseInlineMathAndFormatting(text) {
  if (!text) return null;

  // Split on inline math ($...$), bold (**...**), and code (`...`)
  const regex = /(\$[^$\n]+\$|\*\*[^*]+\*\*|`[^`]+`)/g;
  const parts = text.split(regex);

  return parts.map((part, index) => {
    // 1. Inline Math: $...$
    if (part.startsWith('$') && part.endsWith('$') && part.length > 2) {
      const tex = part.slice(1, -1);
      const html = renderKaTeX(tex, false);
      return (
        <span
          key={index}
          className="inline-math px-0.5 align-middle"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      );
    }

    // 2. Bold text: **...**
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return (
        <strong key={index} className="font-bold text-light-foreground dark:text-dark-foreground">
          {part.slice(2, -2)}
        </strong>
      );
    }

    // 3. Inline Code: `...`
    if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
      return (
        <code
          key={index}
          className="px-1.5 py-0.5 rounded-md font-mono text-xs bg-light-surface-secondary dark:bg-dark-surface-secondary border border-light-border dark:border-dark-border text-primary"
        >
          {part.slice(1, -1)}
        </code>
      );
    }

    return part;
  });
}

/**
 * Formatted Summary Renderer with full KaTeX math and academic hierarchy support
/**
 * Parse raw markdown content into structured AST blocks (headings, tables, math, lists, code, etc.)
 */
function parseBlocks(content) {
  if (!content) return [];

  // Normalize multiline $$ blocks so each display math equation is on its own standalone line
  const normalized = content.replace(/\$\$\s*([\s\S]*?)\s*\$\$/g, (match, p1) => {
    return `\n$$${p1.trim()}$$\n`;
  });

  const rawLines = normalized.split('\n');
  const blocks = [];
  let i = 0;

  while (i < rawLines.length) {
    const line = rawLines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      i++;
      continue;
    }

    // 1. Code Block: ```
    if (trimmed.startsWith('```')) {
      const lang = trimmed.replace(/^```/, '').trim();
      const codeLines = [];
      i++;
      while (i < rawLines.length && !rawLines[i].trim().startsWith('```')) {
        codeLines.push(rawLines[i]);
        i++;
      }
      i++; // skip closing ```
      blocks.push({
        type: 'code',
        language: lang,
        code: codeLines.join('\n'),
      });
      continue;
    }

    // 2. Table Block: check if line starts with | and next line has | ---
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      const nextTrimmed = rawLines[i + 1]?.trim();
      if (nextTrimmed && nextTrimmed.startsWith('|') && /^\|[\s\-:|]+\|$/.test(nextTrimmed)) {
        const headerCells = trimmed
          .slice(1, -1)
          .split('|')
          .map((c) => c.trim());
        i += 2; // skip header and delimiter row

        const rows = [];
        while (i < rawLines.length) {
          const rowTrimmed = rawLines[i].trim();
          if (!rowTrimmed.startsWith('|') || !rowTrimmed.endsWith('|')) break;
          const cells = rowTrimmed
            .slice(1, -1)
            .split('|')
            .map((c) => c.trim());
          rows.push(cells);
          i++;
        }

        blocks.push({
          type: 'table',
          headers: headerCells,
          rows,
        });
        continue;
      }
    }

    // 3. Display Math: $$ ... $$
    if (trimmed.startsWith('$$') && trimmed.endsWith('$$') && trimmed.length > 4) {
      const tex = trimmed.slice(2, -2).trim();
      blocks.push({
        type: 'display_math',
        tex,
      });
      i++;
      continue;
    }

    // 4. Horizontal Rule
    if (trimmed === '---' || trimmed === '***') {
      blocks.push({ type: 'hr' });
      i++;
      continue;
    }

    // 5. Headings
    if (trimmed.startsWith('# ')) {
      blocks.push({ type: 'h1', text: trimmed.replace(/^#\s+/, '') });
      i++;
      continue;
    }
    if (trimmed.startsWith('## ')) {
      blocks.push({ type: 'h2', text: trimmed.replace(/^##\s+/, '') });
      i++;
      continue;
    }
    if (trimmed.startsWith('### ')) {
      blocks.push({ type: 'h3', text: trimmed.replace(/^###\s+/, '') });
      i++;
      continue;
    }
    if (trimmed.startsWith('#### ')) {
      blocks.push({ type: 'h4', text: trimmed.replace(/^####\s+/, '') });
      i++;
      continue;
    }

    // 6. Blockquote
    if (trimmed.startsWith('>')) {
      blocks.push({ type: 'quote', text: trimmed.replace(/^>\s*/, '') });
      i++;
      continue;
    }

    // 7. Bullet List
    if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
      const bulletContent = trimmed.substring(2).trim();
      // Skip weightage lines if present in legacy cached summaries
      if (/^\*?\*?weightage\*?\*?:/i.test(bulletContent)) {
        i++;
        continue;
      }
      blocks.push({ type: 'bullet', text: bulletContent });
      i++;
      continue;
    }

    // 8. Numbered List
    const numberedMatch = trimmed.match(/^(\d+\.)\s+(.+)$/);
    if (numberedMatch) {
      blocks.push({
        type: 'numbered',
        number: numberedMatch[1],
        text: numberedMatch[2],
      });
      i++;
      continue;
    }

    // Skip weightage paragraph if present
    if (/^\*?\*?weightage\*?\*?:/i.test(trimmed)) {
      i++;
      continue;
    }

    // 9. Standard Paragraph
    blocks.push({ type: 'paragraph', text: trimmed });
    i++;
  }

  return blocks;
}

/**
 * Formatted Summary Renderer with full KaTeX math, Markdown tables, and academic hierarchy support
 */
const RenderFormattedSummary = ({ content }) => {
  if (!content) return null;

  const blocks = parseBlocks(content);

  return (
    <div className="space-y-3 text-sm leading-relaxed text-light-foreground dark:text-dark-foreground font-sans">
      {blocks.map((block, idx) => {
        switch (block.type) {
          case 'h1':
            return (
              <h1
                key={idx}
                className="text-lg sm:text-xl font-extrabold text-light-foreground dark:text-dark-foreground pb-2 border-b-2 border-primary/30"
              >
                {parseInlineMathAndFormatting(block.text)}
              </h1>
            );

          case 'h2':
            return (
              <h2
                key={idx}
                className="text-base sm:text-lg font-bold text-light-foreground dark:text-dark-foreground pt-4 pb-1.5 border-b border-light-border dark:border-dark-border"
              >
                {parseInlineMathAndFormatting(block.text)}
              </h2>
            );

          case 'h3':
            return (
              <h3
                key={idx}
                className="text-sm sm:text-base font-bold text-light-foreground dark:text-dark-foreground pt-3 pb-0.5 text-primary"
              >
                {parseInlineMathAndFormatting(block.text)}
              </h3>
            );

          case 'h4':
            return (
              <h4
                key={idx}
                className="text-xs sm:text-sm font-semibold text-light-muted dark:text-dark-muted pt-2 pb-0.5"
              >
                {parseInlineMathAndFormatting(block.text)}
              </h4>
            );

          case 'display_math': {
            const html = renderKaTeX(block.tex, true);
            return (
              <div
                key={idx}
                className="my-3 py-3 px-4 rounded-xl bg-light-surface-secondary/70 dark:bg-dark-surface-secondary/70 border border-light-border dark:border-dark-border overflow-x-auto text-center shadow-xs"
              >
                <div dangerouslySetInnerHTML={{ __html: html }} />
              </div>
            );
          }

          case 'table':
            return (
              <div
                key={idx}
                className="my-4 overflow-x-auto rounded-xl border border-light-border dark:border-dark-border shadow-xs"
              >
                <table className="min-w-full divide-y divide-light-border dark:divide-dark-border text-left text-xs sm:text-sm">
                  <thead className="bg-light-surface-secondary dark:bg-dark-surface-secondary text-light-foreground dark:text-dark-foreground font-semibold">
                    <tr>
                      {block.headers.map((h, hIdx) => (
                        <th
                          key={hIdx}
                          className="px-3.5 py-2.5 border-r last:border-r-0 border-light-border dark:border-dark-border font-bold text-xs uppercase tracking-wider text-light-muted dark:text-dark-muted"
                        >
                          {parseInlineMathAndFormatting(h)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-light-border dark:divide-dark-border">
                    {block.rows.map((row, rIdx) => (
                      <tr
                        key={rIdx}
                        className={
                          rIdx % 2 === 0
                            ? 'bg-transparent'
                            : 'bg-light-surface-secondary/40 dark:bg-dark-surface-secondary/40'
                        }
                      >
                        {row.map((cell, cIdx) => (
                          <td
                            key={cIdx}
                            className="px-3.5 py-2.5 border-r last:border-r-0 border-light-border dark:border-dark-border text-light-foreground/90 dark:text-dark-foreground/90 leading-relaxed align-top"
                          >
                            {parseInlineMathAndFormatting(cell)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );

          case 'code':
            return (
              <pre
                key={idx}
                className="my-3 p-3.5 rounded-xl bg-light-surface-secondary dark:bg-dark-surface-secondary border border-light-border dark:border-dark-border overflow-x-auto font-mono text-xs text-light-foreground dark:text-dark-foreground"
              >
                <code>{block.code}</code>
              </pre>
            );

          case 'quote':
            return (
              <blockquote
                key={idx}
                className="my-2.5 pl-3.5 py-2 border-l-4 border-primary/70 bg-light-surface-secondary/50 dark:bg-dark-surface-secondary/50 rounded-r-xl text-xs sm:text-sm italic text-light-foreground/90 dark:text-dark-foreground/90"
              >
                {parseInlineMathAndFormatting(block.text)}
              </blockquote>
            );

          case 'bullet':
            return (
              <div key={idx} className="flex items-start gap-2.5 pl-1 my-1">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                <div className="flex-1 text-light-foreground dark:text-dark-foreground">
                  {parseInlineMathAndFormatting(block.text)}
                </div>
              </div>
            );

          case 'numbered':
            return (
              <div key={idx} className="flex items-start gap-2.5 pl-1 my-1">
                <span className="font-bold text-primary text-xs mt-0.5 shrink-0">
                  {block.number}
                </span>
                <div className="flex-1 text-light-foreground dark:text-dark-foreground">
                  {parseInlineMathAndFormatting(block.text)}
                </div>
              </div>
            );

          case 'hr':
            return (
              <hr
                key={idx}
                className="my-4 border-light-border dark:border-dark-border"
              />
            );

          case 'paragraph':
          default:
            return (
              <p
                key={idx}
                className="text-light-foreground dark:text-dark-foreground my-1 leading-relaxed"
              >
                {parseInlineMathAndFormatting(block.text)}
              </p>
            );
        }
      })}
    </div>
  );
};

const NoteSummaryModal = ({
  isOpen,
  onClose,
  noteId,
  noteTitle = 'Document',
  subject = '',
}) => {
  const { token } = useAuth();

  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isCached, setIsCached] = useState(false);
  const [copied, setCopied] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  useEffect(() => {
    if (!isOpen || !noteId) return;
    fetchSummary();
  }, [isOpen, noteId]);

  const getHeaders = () => {
    const authToken = token || localStorage.getItem('token');
    const headers = { 'Content-Type': 'application/json' };
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }
    return headers;
  };

  const fetchSummary = async () => {
    setLoading(true);
    setError('');
    setSummary(null);

    try {
      const res = await fetch(`/api/notes/${noteId}/summary`, {
        method: 'GET',
        headers: getHeaders(),
        credentials: 'include',
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.message || 'Failed to retrieve note summary.');
      }

      setSummary(data.summary || '');
      setIsCached(Boolean(data.isCached));
    } catch (err) {
      setError(err.message || 'Could not load summary. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = async () => {
    if (!window.confirm('Regenerate fresh academic summary with formula priority?')) return;
    setRegenerating(true);
    setError('');

    try {
      const res = await fetch(`/api/notes/${noteId}/summary/regenerate`, {
        method: 'POST',
        headers: getHeaders(),
        credentials: 'include',
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || 'Failed to regenerate summary.');
      }

      setSummary(data.summary || '');
      setIsCached(false);
    } catch (err) {
      setError(err.message || 'Regeneration failed.');
    } finally {
      setRegenerating(false);
    }
  };

  const handleCopy = () => {
    if (!summary) return;
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-modal bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fadeIn font-sans">
      <div className="bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-2xl max-w-3xl w-full shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* HEADER BAR */}
        <div className="px-5 sm:px-6 py-4 border-b border-light-border dark:border-dark-border bg-light-surface/95 dark:bg-dark-surface/95 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20">
              <FileText className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-light-foreground dark:text-dark-foreground truncate">
                  Academic Revision Sheet
                </h3>
                {isCached && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-light-surface-secondary dark:bg-dark-surface-secondary border border-light-border dark:border-dark-border text-light-muted dark:text-dark-muted shrink-0">
                    Cached
                  </span>
                )}
              </div>
              <p className="text-xs text-light-muted dark:text-dark-muted truncate mt-0.5">
                {noteTitle} {subject ? `• ${subject}` : ''}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {summary && (
              <>
                <button
                  type="button"
                  onClick={handleRegenerate}
                  disabled={regenerating}
                  title="Regenerate Summary"
                  className="h-9 px-3 rounded-xl bg-light-surface-secondary dark:bg-dark-surface-secondary border border-light-border dark:border-dark-border hover:border-primary text-light-foreground dark:text-dark-foreground text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${regenerating ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">{regenerating ? 'Regenerating...' : 'Regenerate'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopy}
                  title="Copy to Clipboard"
                  className="h-9 px-3 rounded-xl bg-light-surface-secondary dark:bg-dark-surface-secondary border border-light-border dark:border-dark-border hover:border-primary text-light-foreground dark:text-dark-foreground text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-primary" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </>
            )}

            <button
              type="button"
              onClick={onClose}
              className="h-9 w-9 rounded-xl text-light-muted dark:text-dark-muted hover:text-light-foreground dark:hover:text-dark-foreground hover:bg-light-surface-secondary dark:hover:bg-dark-surface-secondary transition-colors flex items-center justify-center cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* MODAL BODY */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 custom-scrollbar">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <div className="space-y-1">
                <p className="text-sm font-semibold text-light-foreground dark:text-dark-foreground">
                  Analyzing document & compiling mathematical equations...
                </p>
                <p className="text-xs text-light-muted dark:text-dark-muted max-w-sm">
                  First synthesis takes ~4–6 seconds. Subsequent views will load instantly from database cache.
                </p>
              </div>
            </div>
          ) : error ? (
            <div className="py-12 flex flex-col items-center justify-center text-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center">
                <AlertCircle className="w-6 h-6" />
              </div>
              <p className="text-sm text-red-500 max-w-md">{error}</p>
              <button
                type="button"
                onClick={fetchSummary}
                className="mt-2 px-4 py-2 rounded-xl bg-light-surface-secondary dark:bg-dark-surface-secondary border border-light-border dark:border-dark-border text-xs font-semibold hover:border-primary transition-all"
              >
                Try Again
              </button>
            </div>
          ) : summary ? (
            <RenderFormattedSummary content={summary} />
          ) : null}
        </div>

        {/* FOOTER BAR */}
        <div className="px-5 sm:px-6 py-2.5 border-t border-light-border dark:border-dark-border bg-light-surface-secondary/40 dark:bg-dark-surface-secondary/40 text-[11px] text-light-muted dark:text-dark-muted flex items-center justify-between shrink-0">
          <span>Formula-Centric University Study Sheet</span>
          <span>LaTeX Math Typesetting Enabled</span>
        </div>

      </div>
    </div>
  );
};

export default NoteSummaryModal;
