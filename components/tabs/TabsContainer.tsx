'use client';

import { useState } from 'react';
import { AlgorithmContent, AlgorithmMeta } from '@/types';
import ExplainTab from './ExplainTab';
import QuizTab from './QuizTab';
import ComplexityTab from './ComplexityTab';
import AnimationTab from './AnimationTab';

const TABS = [
  { id: 'explain',    label: 'הסבר ופסאודו-קוד' },
  { id: 'animation',  label: 'אנימציה' },
  { id: 'quiz',       label: 'שאלות' },
  { id: 'complexity', label: 'סיבוכיות' },
] as const;

type TabId = (typeof TABS)[number]['id'];

interface TabsContainerProps {
  content: AlgorithmContent;
  meta: AlgorithmMeta;
}

export default function TabsContainer({ content, meta }: TabsContainerProps) {
  const [active, setActive] = useState<TabId>('explain');

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Tab bar */}
      <div
        className="flex gap-0"
        style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-card)' }}
      >
        {TABS.map((tab) => {
          const isActive = tab.id === active;
          return (
            <button
              key={tab.id}
              onClick={() => setActive(tab.id)}
              className="px-5 py-3 text-sm font-medium transition-colors relative"
              style={{
                color: isActive ? 'var(--accent-purple)' : 'var(--text-secondary)',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              {tab.label}
              {isActive && (
                <span
                  className="absolute bottom-0 left-0 right-0 h-0.5"
                  style={{ background: 'var(--accent-purple)' }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto p-6">
        {active === 'explain'    && <ExplainTab content={content} />}
        {active === 'animation'  && <AnimationTab meta={meta} />}
        {active === 'quiz'       && <QuizTab content={content} />}
        {active === 'complexity' && <ComplexityTab content={content} />}
      </div>
    </div>
  );
}
