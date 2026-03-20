'use client';

import { AlgorithmContent } from '@/types';
import PseudoCode from '@/components/ui/PseudoCode';

interface Props { content: AlgorithmContent; }

const NOTE_COLORS = [
  'var(--accent-purple)',
  'var(--accent-green)',
  'var(--accent-gold)',
  '#5B9BD5',
  '#E07B39',
  '#c88aff',
  '#1D9E75',
];

export default function ExplainTab({ content }: Props) {
  const isBasics = content.slug === 'basics';
  const hasIO = content.input !== '—' || content.output !== '—';

  return (
    <div className="max-w-3xl mx-auto space-y-6">

      {/* BASICS: prominent notes grid at top */}
      {isBasics && content.notes.length > 0 && (
        <section>
          <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--accent-purple)' }}>
            הגדרות מרכזיות
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 10 }}>
            {content.notes.map((note, i) => (
              <div key={i} style={{
                padding: '12px 14px',
                borderRadius: 8,
                background: 'var(--bg-card)',
                border: `1px solid ${NOTE_COLORS[i % NOTE_COLORS.length]}44`,
                borderRight: `3px solid ${NOTE_COLORS[i % NOTE_COLORS.length]}`,
                display: 'flex',
                alignItems: 'flex-start',
                gap: 10,
              }}>
                <span style={{
                  color: NOTE_COLORS[i % NOTE_COLORS.length],
                  fontWeight: 800, fontSize: 16, lineHeight: 1.4, flexShrink: 0,
                }}>
                  {i + 1}
                </span>
                <span style={{ color: 'var(--text-primary)', fontSize: 14, lineHeight: 1.5 }}>
                  {note}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Goal */}
      <section
        className="rounded-lg p-5"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
      >
        <h2 className="text-base font-semibold mb-2" style={{ color: 'var(--accent-purple)' }}>
          מטרה
        </h2>
        <p style={{ color: 'var(--text-primary)' }}>{content.goal}</p>
      </section>

      {/* Input / Output — hidden when both are placeholder dashes */}
      {hasIO && (
        <section
          className="rounded-lg p-5 grid grid-cols-2 gap-4"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
        >
          <div>
            <h3 className="text-sm font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>קלט</h3>
            <p style={{ color: 'var(--text-primary)' }}>{content.input}</p>
          </div>
          <div>
            <h3 className="text-sm font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>פלט</h3>
            <p style={{ color: 'var(--text-primary)' }}>{content.output}</p>
          </div>
        </section>
      )}

      {/* Pseudocode — hidden for basics (definitions page, no algorithm) */}
      {!isBasics && (
        <section>
          <h2 className="text-base font-semibold mb-2" style={{ color: 'var(--accent-purple)' }}>
            פסאודו-קוד
          </h2>
          <PseudoCode code={content.pseudocode} />
        </section>
      )}

      {/* Notes — standard list for non-basics pages */}
      {!isBasics && content.notes.length > 0 && (
        <section
          className="rounded-lg p-5"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
        >
          <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--accent-purple)' }}>
            הערות חשובות
          </h2>
          <ul className="space-y-2">
            {content.notes.map((note, i) => (
              <li key={i} className="flex gap-2" style={{ color: 'var(--text-primary)' }}>
                <span style={{ color: 'var(--accent-green)', flexShrink: 0 }}>▸</span>
                <span>{note}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
