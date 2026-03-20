'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ALGORITHMS, GROUP_ORDER, GROUP_LABELS, GROUP_COLORS } from '@/data/algorithms';

// ── Types ────────────────────────────────────────────────────────────────────

interface Question {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

type Screen = 'config' | 'loading' | 'exam' | 'summary';
type Difficulty = 'easy' | 'medium' | 'hard';

const DIFFICULTY_OPTIONS: { value: Difficulty; label: string; color: string }[] = [
  { value: 'easy',   label: 'קל',    color: '#1D9E75' },
  { value: 'medium', label: 'בינוני', color: '#EF9F27' },
  { value: 'hard',   label: 'קשה',   color: '#e03939' },
];

const COUNT_OPTIONS = [5, 10, 15, 20];
const OPTION_LABELS = ['א׳', 'ב׳', 'ג׳', 'ד׳'];

// ── Config screen ─────────────────────────────────────────────────────────────

function ConfigScreen({
  onStart,
}: {
  onStart: (algs: string[], count: number, diff: Difficulty, moodleContent: string) => void;
}) {
  const [selected, setSelected] = useState<Set<string>>(
    new Set(ALGORITHMS.map(a => a.slug))
  );
  const [count, setCount] = useState(10);
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [moodleStatus, setMoodleStatus] = useState<'idle' | 'connecting' | 'fetching' | 'done' | 'error'>('idle');
  const [moodleContent, setMoodleContent] = useState('');
  const [moodleError, setMoodleError] = useState('');
  const [moodleFileCount, setMoodleFileCount] = useState(0);

  const loadMoodle = async () => {
    setMoodleStatus('connecting');
    setMoodleError('');
    const timer = setTimeout(() => setMoodleStatus('fetching'), 3000);
    try {
      const res = await fetch('/api/moodle-scraper', { method: 'POST' });
      clearTimeout(timer);
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error ?? 'שגיאה');
      setMoodleContent(data.content);
      setMoodleFileCount(data.fileCount);
      setMoodleStatus('done');
    } catch (e: unknown) {
      clearTimeout(timer);
      setMoodleError(e instanceof Error ? e.message : 'שגיאה בטעינת חומר ממודל');
      setMoodleStatus('error');
    }
  };

  const toggle = (slug: string) =>
    setSelected(prev => {
      const next = new Set(prev);
      next.has(slug) ? next.delete(slug) : next.add(slug);
      return next;
    });

  const allSelected = selected.size === ALGORITHMS.length;

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: '32px 20px' }}>
      <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--accent-purple)', marginBottom: 6 }}>
        מחולל מבחן
      </h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 28, fontSize: 14 }}>
        בחר נושאים, מספר שאלות ורמת קושי — ה-AI יצור עבורך מבחן מותאם אישית.
      </p>

      {/* Algorithm selection */}
      <section style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>נושאים</h2>
          <button
            onClick={() => setSelected(allSelected ? new Set() : new Set(ALGORITHMS.map(a => a.slug)))}
            style={{
              fontSize: 12, color: 'var(--accent-purple)', background: 'none',
              border: 'none', cursor: 'pointer', fontWeight: 600,
            }}
          >
            {allSelected ? 'בטל הכל' : 'בחר הכל'}
          </button>
        </div>

        {GROUP_ORDER.map(group => {
          const algs = ALGORITHMS.filter(a => a.group === group);
          const color = GROUP_COLORS[group];
          return (
            <div key={group} style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color, textTransform: 'uppercase',
                letterSpacing: 1, marginBottom: 6 }}>
                {GROUP_LABELS[group]}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {algs.map(alg => {
                  const on = selected.has(alg.slug);
                  return (
                    <button key={alg.slug} onClick={() => toggle(alg.slug)} style={{
                      padding: '6px 12px', borderRadius: 6, fontSize: 13, cursor: 'pointer',
                      border: `1px solid ${on ? color : 'var(--border)'}`,
                      background: on ? `${color}18` : 'transparent',
                      color: on ? color : 'var(--text-secondary)',
                      fontWeight: on ? 600 : 400,
                      transition: 'all 0.15s',
                    }}>
                      {alg.name}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </section>

      {/* Moodle section */}
      <section style={{
        marginBottom: 28, padding: '16px 18px', borderRadius: 10,
        border: '1px solid var(--border)', background: 'var(--bg-card)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: moodleStatus !== 'idle' ? 10 : 0 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
            🎓 חומר ממודל <span style={{ fontWeight: 400, fontSize: 13, color: 'var(--text-secondary)' }}>(אופציונלי)</span>
          </h2>
          <button
            onClick={loadMoodle}
            disabled={moodleStatus === 'connecting' || moodleStatus === 'fetching'}
            style={{
              padding: '7px 14px', borderRadius: 7, fontSize: 13, fontWeight: 600,
              cursor: moodleStatus === 'connecting' || moodleStatus === 'fetching' ? 'default' : 'pointer',
              border: '1px solid var(--accent-purple)',
              background: moodleStatus === 'done' ? '#7F77DD22' : 'transparent',
              color: 'var(--accent-purple)',
              opacity: moodleStatus === 'connecting' || moodleStatus === 'fetching' ? 0.6 : 1,
            }}
          >
            {moodleStatus === 'connecting' || moodleStatus === 'fetching' ? '⟳ טוען...' : 'טען חומר ממודל'}
          </button>
        </div>
        {moodleStatus === 'connecting' && (
          <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>⟳ מתחבר למודל...</div>
        )}
        {moodleStatus === 'fetching' && (
          <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>⟳ מביא קבצים...</div>
        )}
        {moodleStatus === 'done' && (
          <div style={{ fontSize: 13, color: '#1D9E75', fontWeight: 600 }}>✓ נטען: {moodleFileCount} קבצים</div>
        )}
        {moodleStatus === 'error' && (
          <div style={{ fontSize: 13, color: '#e03939' }}>⚠ {moodleError}</div>
        )}
      </section>

      {/* Count & Difficulty */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 32 }}>
        <section>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 10 }}>
            מספר שאלות
          </h2>
          <div style={{ display: 'flex', gap: 8 }}>
            {COUNT_OPTIONS.map(n => (
              <button key={n} onClick={() => setCount(n)} style={{
                flex: 1, padding: '10px 0', borderRadius: 8, fontSize: 15, fontWeight: 700,
                cursor: 'pointer', border: `1px solid ${count === n ? 'var(--accent-purple)' : 'var(--border)'}`,
                background: count === n ? '#7F77DD22' : 'var(--bg-card)',
                color: count === n ? 'var(--accent-purple)' : 'var(--text-secondary)',
                transition: 'all 0.15s',
              }}>{n}</button>
            ))}
          </div>
        </section>

        <section>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 10 }}>
            רמת קושי
          </h2>
          <div style={{ display: 'flex', gap: 8 }}>
            {DIFFICULTY_OPTIONS.map(d => (
              <button key={d.value} onClick={() => setDifficulty(d.value)} style={{
                flex: 1, padding: '10px 0', borderRadius: 8, fontSize: 14, fontWeight: 700,
                cursor: 'pointer', border: `1px solid ${difficulty === d.value ? d.color : 'var(--border)'}`,
                background: difficulty === d.value ? `${d.color}18` : 'var(--bg-card)',
                color: difficulty === d.value ? d.color : 'var(--text-secondary)',
                transition: 'all 0.15s',
              }}>{d.label}</button>
            ))}
          </div>
        </section>
      </div>

      <button
        disabled={selected.size === 0}
        onClick={() => onStart([...selected], count, difficulty, moodleContent)}
        style={{
          width: '100%', padding: '14px 0', borderRadius: 10,
          background: selected.size > 0 ? '#7F77DD' : '#2e2e42',
          border: 'none', color: selected.size > 0 ? '#fff' : '#5555777',
          fontSize: 16, fontWeight: 800, cursor: selected.size > 0 ? 'pointer' : 'default',
          transition: 'background 0.2s',
        }}
      >
        {selected.size === 0 ? 'בחר לפחות נושא אחד' : `צור מבחן (${count} שאלות)`}
      </button>
    </div>
  );
}

// ── Loading screen ────────────────────────────────────────────────────────────

function LoadingScreen() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', height: '60vh', gap: 20 }}>
      <div style={{ display: 'flex', gap: 8 }}>
        {[0, 1, 2].map(i => (
          <motion.div key={i}
            animate={{ y: [-8, 0, -8] }}
            transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.18 }}
            style={{ width: 12, height: 12, borderRadius: '50%', background: '#7F77DD' }}
          />
        ))}
      </div>
      <div style={{ color: 'var(--text-secondary)', fontSize: 15 }}>
        ה-AI מכין את המבחן שלך...
      </div>
    </div>
  );
}

// ── Exam screen ───────────────────────────────────────────────────────────────

function ExamScreen({
  questions,
  onFinish,
}: {
  questions: Question[];
  onFinish: (answers: (number | null)[]) => void;
}) {
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(Array(questions.length).fill(null));
  const [revealed, setRevealed] = useState(false);

  const q = questions[idx];
  const chosen = answers[idx];
  const isLast = idx === questions.length - 1;

  const choose = (i: number) => {
    if (revealed) return;
    setAnswers(prev => { const a = [...prev]; a[idx] = i; return a; });
    setRevealed(true);
  };

  const next = () => {
    if (isLast) { onFinish(answers); return; }
    setIdx(i => i + 1);
    setRevealed(false);
  };

  const diffColor = (i: number) => {
    if (!revealed) return { border: 'var(--border)', bg: 'var(--bg-card)', color: 'var(--text-primary)' };
    if (i === q.correct) return { border: '#1D9E75', bg: '#1D9E7520', color: '#1D9E75' };
    if (i === chosen)    return { border: '#e03939',  bg: '#e0393920',  color: '#e03939'  };
    return { border: 'var(--border)', bg: 'var(--bg-card)', color: 'var(--text-secondary)' };
  };

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '32px 20px' }}>
      {/* Progress */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6,
          fontSize: 13, color: 'var(--text-secondary)' }}>
          <span>שאלה {idx + 1} מתוך {questions.length}</span>
          <span>{Math.round(((idx) / questions.length) * 100)}%</span>
        </div>
        <div style={{ height: 4, borderRadius: 2, background: 'var(--border)' }}>
          <motion.div
            animate={{ width: `${((idx + 1) / questions.length) * 100}%` }}
            style={{ height: '100%', borderRadius: 2, background: '#7F77DD' }}
          />
        </div>
        {/* Dot indicators */}
        <div style={{ display: 'flex', gap: 4, marginTop: 8, flexWrap: 'wrap' }}>
          {questions.map((_, i) => {
            const a = answers[i];
            const color = a === null
              ? (i === idx ? '#7F77DD' : 'var(--border)')
              : (a === questions[i].correct ? '#1D9E75' : '#e03939');
            return (
              <div key={i} style={{
                width: 8, height: 8, borderRadius: '50%', background: color,
                border: i === idx ? '1px solid #7F77DD' : 'none',
                transition: 'background 0.3s',
              }} />
            );
          })}
        </div>
      </div>

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div key={idx}
          initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>

          <div style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 12, padding: '24px 22px', marginBottom: 16,
          }}>
            <div style={{ fontSize: 11, color: 'var(--accent-purple)', fontWeight: 700,
              marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              שאלה {idx + 1}
            </div>
            <p style={{ fontSize: 17, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.6 }}>
              {q.question}
            </p>
          </div>

          {/* Options */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
            {q.options.map((opt, i) => {
              const s = diffColor(i);
              return (
                <button key={i} onClick={() => choose(i)} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '13px 16px', borderRadius: 10, textAlign: 'right',
                  cursor: revealed ? 'default' : 'pointer',
                  border: `1px solid ${s.border}`,
                  background: s.bg,
                  color: s.color,
                  fontSize: 14, fontWeight: 500,
                  transition: 'all 0.15s',
                  width: '100%',
                }}>
                  <span style={{
                    minWidth: 28, height: 28, borderRadius: '50%',
                    background: revealed
                      ? (i === q.correct ? '#1D9E75' : (i === chosen ? '#e03939' : 'var(--border)'))
                      : '#2e2e42',
                    color: '#fff', fontSize: 12, fontWeight: 800,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    {OPTION_LABELS[i]}
                  </span>
                  <span style={{ flex: 1 }}>{opt}</span>
                  {revealed && i === q.correct && (
                    <span style={{ color: '#1D9E75', fontSize: 18 }}>✓</span>
                  )}
                  {revealed && i === chosen && i !== q.correct && (
                    <span style={{ color: '#e03939', fontSize: 18 }}>✗</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Explanation */}
          <AnimatePresence>
            {revealed && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                style={{
                  padding: '14px 16px', borderRadius: 10, marginBottom: 16,
                  background: chosen === q.correct ? '#1D9E7518' : '#e0393918',
                  border: `1px solid ${chosen === q.correct ? '#1D9E7544' : '#e0393944'}`,
                }}>
                <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4,
                  color: chosen === q.correct ? '#1D9E75' : '#e03939' }}>
                  {chosen === q.correct ? '✓ תשובה נכונה!' : '✗ תשובה שגויה'}
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.6 }}>
                  {q.explanation}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {revealed && (
            <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              onClick={next} style={{
                width: '100%', padding: '13px 0', borderRadius: 10,
                background: '#7F77DD', border: 'none', color: '#fff',
                fontSize: 15, fontWeight: 700, cursor: 'pointer',
              }}>
              {isLast ? 'סיום המבחן' : 'שאלה הבאה →'}
            </motion.button>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ── Summary screen ────────────────────────────────────────────────────────────

function SummaryScreen({
  questions,
  answers,
  onRetake,
  onNew,
}: {
  questions: Question[];
  answers: (number | null)[];
  onRetake: () => void;
  onNew: () => void;
}) {
  const correct = answers.filter((a, i) => a === questions[i].correct).length;
  const pct = Math.round((correct / questions.length) * 100);
  const color = pct >= 80 ? '#1D9E75' : pct >= 55 ? '#EF9F27' : '#e03939';
  const [expanded, setExpanded] = useState<number | null>(null);

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '32px 20px' }}>
      {/* Score */}
      <div style={{
        textAlign: 'center', padding: '32px 20px', marginBottom: 28,
        background: 'var(--bg-card)', borderRadius: 16,
        border: `1px solid ${color}44`,
      }}>
        <div style={{ fontSize: 64, fontWeight: 900, color, fontFamily: 'monospace', lineHeight: 1 }}>
          {correct}/{questions.length}
        </div>
        <div style={{ fontSize: 22, fontWeight: 700, color, marginTop: 6 }}>
          {pct}%
        </div>
        <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 8 }}>
          {pct >= 85 ? '🏆 מצוין! שלטת בחומר.' : pct >= 70 ? '👍 טוב! עוד קצת עבודה.' : pct >= 55 ? '📚 בינוני — כדאי לחזור על החומר.' : '💡 כדאי לחזור על הנושאים שהפלת.'}
        </div>
        {/* Progress bar */}
        <div style={{ height: 8, borderRadius: 4, background: 'var(--border)', margin: '16px auto 0', maxWidth: 300 }}>
          <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }}
            transition={{ duration: 0.8, delay: 0.2 }}
            style={{ height: '100%', borderRadius: 4, background: color }} />
        </div>
      </div>

      {/* Question review */}
      <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>
        סקירת שאלות
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 28 }}>
        {questions.map((q, i) => {
          const ok = answers[i] === q.correct;
          const isOpen = expanded === i;
          return (
            <div key={i} style={{
              borderRadius: 10, overflow: 'hidden',
              border: `1px solid ${ok ? '#1D9E7533' : '#e0393933'}`,
            }}>
              <button onClick={() => setExpanded(isOpen ? null : i)} style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                padding: '12px 14px', background: ok ? '#1D9E7510' : '#e0393910',
                border: 'none', cursor: 'pointer', textAlign: 'right',
              }}>
                <span style={{
                  width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                  background: ok ? '#1D9E75' : '#e03939',
                  color: '#fff', fontSize: 13, fontWeight: 800,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {ok ? '✓' : '✗'}
                </span>
                <span style={{ flex: 1, fontSize: 13, color: 'var(--text-primary)',
                  textAlign: 'right', fontWeight: 500 }}>
                  {q.question}
                </span>
                <span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>
                  {isOpen ? '▲' : '▼'}
                </span>
              </button>
              <AnimatePresence>
                {isOpen && (
                  <motion.div initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
                    <div style={{ padding: '12px 14px', borderTop: '1px solid var(--border)',
                      background: 'var(--bg-card)' }}>
                      {q.options.map((opt, j) => (
                        <div key={j} style={{
                          display: 'flex', gap: 8, padding: '4px 0', fontSize: 13,
                          color: j === q.correct ? '#1D9E75'
                            : (j === answers[i] && !ok) ? '#e03939'
                            : 'var(--text-secondary)',
                          fontWeight: j === q.correct ? 700 : 400,
                        }}>
                          <span>{OPTION_LABELS[j]}.</span>
                          <span>{opt}</span>
                        </div>
                      ))}
                      <div style={{ marginTop: 10, padding: '8px 12px', borderRadius: 6,
                        background: '#7F77DD15', border: '1px solid #7F77DD33',
                        fontSize: 12, color: 'var(--text-primary)', lineHeight: 1.6 }}>
                        💡 {q.explanation}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 12 }}>
        <button onClick={onRetake} style={{
          flex: 1, padding: '13px 0', borderRadius: 10,
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          color: 'var(--text-primary)', fontSize: 15, fontWeight: 700, cursor: 'pointer',
        }}>
          נסה שוב
        </button>
        <button onClick={onNew} style={{
          flex: 1, padding: '13px 0', borderRadius: 10,
          background: '#7F77DD', border: 'none',
          color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer',
        }}>
          מבחן חדש
        </button>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function ExamPage() {
  const [screen, setScreen] = useState<Screen>('config');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [error, setError] = useState('');
  const [lastConfig, setLastConfig] = useState<{
    algs: string[]; count: number; diff: Difficulty; moodleContent: string;
  } | null>(null);

  const generate = async (algs: string[], count: number, diff: Difficulty, moodleContent: string) => {
    setLastConfig({ algs, count, diff, moodleContent });
    setScreen('loading');
    setError('');
    try {
      const res = await fetch('/api/generate-exam', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ algorithms: algs, count, difficulty: diff, moodleContext: moodleContent || undefined }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error ?? 'שגיאה');
      setQuestions(data.questions);
      setAnswers(Array(data.questions.length).fill(null));
      setScreen('exam');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'שגיאה ביצירת המבחן');
      setScreen('config');
    }
  };

  const retake = () => {
    setAnswers(Array(questions.length).fill(null));
    setScreen('exam');
  };

  return (
    <div style={{ flex: 1, overflowY: 'auto', background: 'var(--bg-main)' }}>
      {error && (
        <div style={{
          margin: '16px auto', maxWidth: 680, padding: '12px 16px',
          background: '#e0393918', border: '1px solid #e0393944',
          borderRadius: 8, color: '#e03939', fontSize: 13,
        }}>
          ⚠ {error}
        </div>
      )}

      <AnimatePresence mode="wait">
        {screen === 'config' && (
          <motion.div key="config" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <ConfigScreen onStart={generate} />
          </motion.div>
        )}
        {screen === 'loading' && (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <LoadingScreen />
          </motion.div>
        )}
        {screen === 'exam' && (
          <motion.div key="exam" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <ExamScreen questions={questions} onFinish={a => { setAnswers(a); setScreen('summary'); }} />
          </motion.div>
        )}
        {screen === 'summary' && (
          <motion.div key="summary" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <SummaryScreen
              questions={questions} answers={answers}
              onRetake={retake}
              onNew={() => setScreen('config')}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
