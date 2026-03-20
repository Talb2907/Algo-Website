'use client';

const KEYWORDS = [
  'for', 'while', 'if', 'else', 'return', 'each', 'to', 'and', 'or', 'not', 'in',
];

function highlight(line: string): string {
  // Whole-line comment (possibly indented)
  if (line.trimStart().startsWith('//')) {
    const indent = line.length - line.trimStart().length;
    const spaces = line.slice(0, indent);
    return `${spaces}<span class="cmt">${line.slice(indent).replace(/</g, '&lt;').replace(/>/g, '&gt;')}</span>`;
  }

  // Escape HTML first
  let out = line
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Inline comments — capture tail and remove before other processing
  let commentTail = '';
  const commentIdx = out.indexOf('//');
  if (commentIdx !== -1) {
    commentTail = `<span class="cmt">${out.slice(commentIdx)}</span>`;
    out = out.slice(0, commentIdx);
  }

  // Functions: ALL-CAPS words (min 2 chars, may contain dashes) followed by (
  out = out.replace(/\b([A-Z][A-Z\-]+)\s*(?=\()/g, '<span class="fn">$1</span>');

  // Keywords (whole word, case-sensitive)
  for (const kw of KEYWORDS) {
    out = out.replace(new RegExp(`\\b(${kw})\\b`, 'g'), '<span class="kw">$1</span>');
  }

  // Numbers (standalone)
  out = out.replace(/\b(\d+)\b/g, '<span class="num">$1</span>');

  return out + commentTail;
}

interface PseudoCodeProps {
  code: string;
  highlightLine?: number; // 1-based line to highlight (for animations)
}

export default function PseudoCode({ code, highlightLine }: PseudoCodeProps) {
  const lines = code.split('\n');

  return (
    <div
      className="rounded-lg overflow-auto"
      style={{
        background: '#0a0a12',
        border: '1px solid var(--border)',
        fontFamily: "'Consolas', 'Fira Code', 'Monaco', monospace",
        fontSize: 13,
        lineHeight: 1.75,
      }}
    >
      <table style={{ borderCollapse: 'collapse', width: '100%' }}>
        <tbody>
          {lines.map((line, i) => {
            const lineNum = i + 1;
            const isHighlighted = highlightLine === lineNum;
            return (
              <tr
                key={i}
                style={{
                  verticalAlign: 'top',
                  background: isHighlighted ? 'rgba(127,119,221,0.15)' : 'transparent',
                }}
              >
                <td
                  style={{
                    userSelect: 'none',
                    textAlign: 'right',
                    paddingRight: 12,
                    paddingLeft: 12,
                    color: isHighlighted ? 'var(--accent-purple)' : 'var(--text-secondary)',
                    borderRight: `1px solid ${isHighlighted ? 'var(--accent-purple)' : 'var(--border)'}`,
                    minWidth: 38,
                    fontSize: 11,
                    fontFamily: 'monospace',
                  }}
                >
                  {lineNum}
                </td>
                <td
                  style={{
                    paddingLeft: 16,
                    paddingRight: 16,
                    color: 'var(--text-primary)',
                    whiteSpace: 'pre',
                    paddingTop: 1,
                    paddingBottom: 1,
                  }}
                  dangerouslySetInnerHTML={{ __html: highlight(line) }}
                />
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
