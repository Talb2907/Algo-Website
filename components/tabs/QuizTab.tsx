'use client';

import { useEffect, useState } from 'react';
import { AlgorithmContent } from '@/types';
import { useQuizStore } from '@/store/quizStore';

interface Props { content: AlgorithmContent; }

const OPTION_COLORS = ['#7F77DD', '#1D9E75', '#EF9F27', '#E07B39'];
const LETTERS = ['A', 'B', 'C', 'D'];

export default function QuizTab({ content }: Props) {
  const { scores, setAnswer, resetAlgorithm } = useQuizStore();
  const [hydrated, setHydrated] = useState(false);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    useQuizStore.persist.rehydrate();
    setHydrated(true);
  }, []);

  if (!hydrated) return null;

  const score = scores[content.slug] ?? { correct: 0, total: 0, answered: {}, selected: {} };
  const questions = content.questions;
  const q = questions[current];
  const alreadyAnswered = score.answered[current] !== undefined;
  const wasCorrect = score.answered[current];
  const chosenIdx = score.selected[current] ?? null;

  function handleSelect(idx: number) {
    if (alreadyAnswered) return;
    setAnswer(content.slug, current, idx, idx === q.correct);
  }

  function handleReset() {
    resetAlgorithm(content.slug);
    setCurrent(0);
  }

  function getOptionStyle(idx: number) {
    if (!alreadyAnswered) {
      return {
        background: 'var(--bg-main)',
        border: '1px solid var(--border)',
        color: 'var(--text-primary)',
        cursor: 'pointer',
      };
    }
    if (idx === q.correct) {
      return { background: '#1D9E7520', border: '1px solid var(--accent-green)', color: 'var(--accent-green)', cursor: 'default' };
    }
    if (idx === chosenIdx && !wasCorrect) {
      return { background: '#e0393920', border: '1px solid #e03939', color: '#e03939', cursor: 'default' };
    }
    return { background: 'var(--bg-main)', border: '1px solid var(--border)', color: 'var(--text-secondary)', cursor: 'default' };
  }

  const answeredCount = Object.keys(score.answered).length;

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Progress bar */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
            שאלה {current + 1} / {questions.length}
          </span>
          <span style={{ color: 'var(--accent-green)', fontWeight: 600, fontSize: 13 }}>
            {score.correct} נכון מתוך {score.total} שנענו
          </span>
        </div>
        <div className="flex gap-1">
          {questions.map((_, i) => {
            const ans = score.answered[i];
            const isCurrent = i === current;
            let bg = 'var(--border)';
            if (ans === true)  bg = 'var(--accent-green)';
            if (ans === false) bg = '#e03939';
            return (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                style={{
                  flex: 1,
                  height: 4,
                  borderRadius: 2,
                  background: bg,
                  border: isCurrent ? '1px solid var(--accent-purple)' : 'none',
                  cursor: 'pointer',
                  padding: 0,
                  outline: isCurrent ? '2px solid var(--accent-purple)' : 'none',
                  outlineOffset: 1,
                }}
              />
            );
          })}
        </div>
      </div>

      {/* Question card */}
      <div
        className="rounded-lg p-5"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
      >
        <p className="text-base font-medium mb-4" style={{ color: 'var(--text-primary)', lineHeight: 1.6 }}>
          {q.q}
        </p>

        <div className="space-y-2">
          {q.options.map((opt, idx) => {
            const style = getOptionStyle(idx);
            const isCorrect = idx === q.correct;
            const isChosen = idx === chosenIdx;
            return (
              <button
                key={idx}
                onClick={() => handleSelect(idx)}
                disabled={alreadyAnswered}
                className="w-full text-right flex items-center gap-3 rounded-lg px-4 py-3 transition-all"
                style={style}
              >
                <span
                  className="text-xs font-bold rounded px-1.5 py-0.5 flex-shrink-0"
                  style={{
                    background: `${OPTION_COLORS[idx]}25`,
                    color: OPTION_COLORS[idx],
                    minWidth: 22,
                    textAlign: 'center',
                  }}
                >
                  {LETTERS[idx]}
                </span>
                <span className="flex-1">{opt}</span>
                {alreadyAnswered && isCorrect && (
                  <span style={{ color: 'var(--accent-green)', fontWeight: 700 }}>✓</span>
                )}
                {alreadyAnswered && isChosen && !isCorrect && (
                  <span style={{ color: '#e03939', fontWeight: 700 }}>✗</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Explanation */}
        {alreadyAnswered && (
          <div
            className="mt-4 p-4 rounded-lg text-sm"
            style={{
              background: wasCorrect ? '#1D9E7510' : '#e0393910',
              border: `1px solid ${wasCorrect ? 'var(--accent-green)' : '#e03939'}`,
              color: 'var(--text-primary)',
              lineHeight: 1.6,
            }}
          >
            <span style={{ fontWeight: 700, color: wasCorrect ? 'var(--accent-green)' : '#e03939', marginLeft: 6 }}>
              {wasCorrect ? '✓ נכון!' : '✗ שגוי.'}
            </span>
            {q.explanation}
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={handleReset}
          className="px-3 py-2 rounded-lg text-xs"
          style={{
            background: 'transparent',
            border: '1px solid var(--border)',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
          }}
        >
          ↺ התחל מחדש
        </button>
        <div className="flex gap-2">
          <button
            onClick={() => setCurrent(Math.max(0, current - 1))}
            disabled={current === 0}
            className="px-4 py-2 rounded-lg text-sm"
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              color: current === 0 ? 'var(--text-secondary)' : 'var(--text-primary)',
              cursor: current === 0 ? 'default' : 'pointer',
              opacity: current === 0 ? 0.4 : 1,
            }}
          >
            ← הקודם
          </button>
          <button
            onClick={() => setCurrent(Math.min(questions.length - 1, current + 1))}
            disabled={current === questions.length - 1}
            className="px-4 py-2 rounded-lg text-sm font-medium"
            style={{
              background: 'var(--accent-purple)',
              border: 'none',
              color: '#fff',
              cursor: current === questions.length - 1 ? 'default' : 'pointer',
              opacity: current === questions.length - 1 ? 0.4 : 1,
            }}
          >
            הבא →
          </button>
        </div>
      </div>

      {/* Completion banner */}
      {answeredCount === questions.length && (
        <div
          className="rounded-lg p-4 text-center"
          style={{
            background: score.correct === questions.length ? '#1D9E7518' : '#EF9F2718',
            border: `1px solid ${score.correct === questions.length ? 'var(--accent-green)' : 'var(--accent-gold)'}`,
          }}
        >
          <p className="font-bold text-base" style={{ color: score.correct === questions.length ? 'var(--accent-green)' : 'var(--accent-gold)' }}>
            {score.correct === questions.length
              ? `מושלם! ${score.correct}/${questions.length} ✓`
              : `${score.correct}/${questions.length} — נסה שוב!`}
          </p>
        </div>
      )}
    </div>
  );
}
