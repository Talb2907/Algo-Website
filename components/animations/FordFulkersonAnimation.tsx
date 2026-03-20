'use client';

import GraphCanvas, { NodeState, EdgeState } from './GraphCanvas';
import AnimationControls from './AnimationControls';
import { useAnimation } from '@/hooks/useAnimation';
import { GRAPH_FLOW } from '@/data/graphs';

type NS  = Record<string, NodeState>;
type ES  = Record<string, EdgeState>;
type Flw = Record<string, number>;

interface Step {
  ns: NS; es: ES;
  flow: Flw;
  totalFlow: number;
  path: string;
  bottleneck: number | null;
  info: string;
}

const mk = (
  ns: NS, es: ES,
  flow: Flw, totalFlow: number,
  path: string, bottleneck: number | null,
  info: string
): Step => ({ ns, es, flow, totalFlow, path, bottleneck, info });

// Capacities
const CAP: Record<string, number> = {
  's->a': 16, 's->c': 13,
  'a->b': 12, 'a->c': 10,
  'c->a': 4,
  'b->t': 20,
  'c->d': 14,
  'd->b': 7, 'd->t': 4,
};

const F0: Flw = { 's->a':0, 's->c':0, 'a->b':0, 'a->c':0, 'c->a':0, 'b->t':0, 'c->d':0, 'd->b':0, 'd->t':0 };
const SRC: NS = { s:'black', a:'white', b:'white', c:'white', d:'white', t:'white' };

const STEPS: Step[] = [
  mk(SRC, {}, F0, 0, '', null,
    'פורד-פולקרסון: מצא נתיב מגדיל (augmenting path) מ-s ל-t ברשת השיורית. שלח זרם בכל נתיב.'),

  // Path 1: s→a→b→t, bottleneck=12
  mk({ ...SRC, a:'gray', b:'gray', t:'gray' },
    { 's->a':'active', 'a->b':'active', 'b->t':'active' },
    F0, 0, 's → a → b → t', 12,
    'נתיב 1: s→a→b→t. צוואר הבקבוק = min(16,12,20) = 12. שלח 12 יחידות.'),

  mk({ s:'black', a:'black', b:'black', c:'white', d:'white', t:'black' },
    { 's->a':'tree', 'a->b':'tree', 'b->t':'tree' },
    { ...F0, 's->a':12, 'a->b':12, 'b->t':12 }, 12, '', null,
    'עדכון: f[s→a]=12/16, f[a→b]=12/12, f[b→t]=12/20. זרם כולל=12.'),

  // Path 2: s→c→d→t, bottleneck=4
  mk({ s:'black', a:'black', b:'black', c:'gray', d:'gray', t:'black' },
    { 's->a':'tree', 'a->b':'tree', 'b->t':'tree', 's->c':'active', 'c->d':'active', 'd->t':'active' },
    { ...F0, 's->a':12, 'a->b':12, 'b->t':12 }, 12, 's → c → d → t', 4,
    'נתיב 2: s→c→d→t. צוואר הבקבוק = min(13,14,4) = 4. שלח 4 יחידות.'),

  mk({ s:'black', a:'black', b:'black', c:'black', d:'black', t:'black' },
    { 's->a':'tree', 'a->b':'tree', 'b->t':'tree', 's->c':'tree', 'c->d':'tree', 'd->t':'tree' },
    { ...F0, 's->a':12, 's->c':4, 'a->b':12, 'b->t':12, 'c->d':4, 'd->t':4 }, 16, '', null,
    'עדכון: f[s→c]=4/13, f[c→d]=4/14, f[d→t]=4/4. זרם כולל=16.'),

  // Path 3: s→c→d→b→t, bottleneck=7
  mk({ s:'black', a:'black', b:'black', c:'gray', d:'gray', t:'black' },
    { 's->a':'tree', 'a->b':'tree', 'b->t':'tree', 's->c':'active', 'c->d':'active', 'd->b':'active', 'd->t':'tree' },
    { ...F0, 's->a':12, 's->c':4, 'a->b':12, 'b->t':12, 'c->d':4, 'd->t':4 }, 16,
    's → c → d → b → t', 7,
    'נתיב 3: s→c→d→b→t. קיבולת שיורית: s→c=9, c→d=10, d→b=7, b→t=8. צוואר הבקבוק=7. שלח 7.'),

  mk({ s:'black', a:'black', b:'black', c:'black', d:'black', t:'black' },
    { 's->a':'tree', 'a->b':'tree', 'b->t':'tree', 's->c':'tree', 'c->d':'tree', 'd->b':'tree', 'd->t':'tree' },
    { 's->a':12, 's->c':11, 'a->b':12, 'a->c':0, 'c->a':0, 'b->t':19, 'c->d':11, 'd->b':7, 'd->t':4 }, 23, '', null,
    'עדכון: f[s→c]=11/13, f[c→d]=11/14, f[d→b]=7/7, f[b→t]=19/20. זרם כולל=23.'),

  // No more augmenting paths
  mk({ s:'black', a:'black', b:'black', c:'black', d:'black', t:'black' },
    { 's->a':'tree', 'a->b':'tree', 'b->t':'tree', 's->c':'tree', 'c->d':'tree', 'd->b':'tree', 'd->t':'tree' },
    { 's->a':12, 's->c':11, 'a->b':12, 'a->c':0, 'c->a':0, 'b->t':19, 'c->d':11, 'd->b':7, 'd->t':4 }, 23, '', null,
    '✓ אין עוד נתיבים מגדילים ברשת השיורית. זרם מקסימלי = 23. חתך מינימלי: {s,a,b,c,d} | {t}.'),
];

// All edges in display order
const EDGE_LIST = [
  { key:'s->a', label:'s→a' }, { key:'s->c', label:'s→c' },
  { key:'a->b', label:'a→b' }, { key:'a->c', label:'a→c' },
  { key:'c->a', label:'c→a' }, { key:'b->t', label:'b→t' },
  { key:'c->d', label:'c→d' }, { key:'d->b', label:'d→b' },
  { key:'d->t', label:'d→t' },
];

export default function FordFulkersonAnimation() {
  const anim = useAnimation(STEPS.length);
  const s = STEPS[anim.step];

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
      {/* Total flow banner */}
      <div style={{
        display:'flex', justifyContent:'space-between', alignItems:'center',
        padding:'8px 16px', borderRadius:8,
        background: s.totalFlow >= 23 ? '#1D9E7520' : '#7F77DD18',
        border: `1px solid ${s.totalFlow >= 23 ? 'var(--accent-green)' : 'var(--accent-purple)'}`,
      }}>
        <span style={{ fontSize:13, color:'var(--text-secondary)' }}>זרם מקסימלי</span>
        <span style={{ fontSize:20, fontFamily:'monospace', fontWeight:800,
          color: s.totalFlow >= 23 ? 'var(--accent-green)' : 'var(--accent-gold)' }}>
          {s.totalFlow} / 23
        </span>
        {s.bottleneck !== null && (
          <span style={{ fontSize:13, padding:'2px 10px', borderRadius:4,
            background:'#EF9F2730', border:'1px solid var(--accent-gold)',
            color:'var(--accent-gold)', fontFamily:'monospace' }}>
            צוואר: {s.bottleneck}
          </span>
        )}
      </div>

      {/* Graph */}
      <div className="rounded-lg" style={{ background:'#0a0a12', border:'1px solid var(--border)', padding:'10px 8px' }}>
        <GraphCanvas
          nodes={GRAPH_FLOW.nodes} edges={GRAPH_FLOW.edges}
          directed nodeStates={s.ns} edgeStates={s.es}
        />
        {s.path && (
          <div style={{ padding:'4px 10px', borderTop:'1px solid var(--border)',
            fontSize:13, fontFamily:'monospace', color:'var(--accent-gold)', fontWeight:700 }}>
            נתיב נוכחי: {s.path}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="rounded-lg px-4 py-3 text-sm"
        style={{ background:'var(--bg-card)', border:'1px solid var(--accent-purple)', color:'var(--text-primary)', minHeight:44, lineHeight:1.6 }}>
        <span style={{ color:'var(--accent-purple)', fontWeight:700, marginLeft:6 }}>שלב {anim.step+1}:</span>
        {s.info}
      </div>

      {/* Flow table */}
      <div className="rounded-lg p-3" style={{ background:'var(--bg-card)', border:'1px solid var(--border)' }}>
        <div style={{ fontSize:11, color:'var(--text-secondary)', fontWeight:600, marginBottom:8 }}>
          זרם / קיבולת על כל קשת
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:6 }}>
          {EDGE_LIST.map(({ key, label }) => {
            const f = s.flow[key] ?? 0;
            const c = CAP[key];
            const isActive = s.es[key] === 'active';
            const isTree   = s.es[key] === 'tree';
            const full = f === c && c > 0;
            return (
              <div key={key} style={{
                display:'flex', justifyContent:'space-between', alignItems:'center',
                padding:'3px 8px', borderRadius:4, fontSize:12, fontFamily:'monospace',
                background: isActive ? '#EF9F2718' : 'transparent',
                border: `1px solid ${isActive ? 'var(--accent-gold)' : isTree ? 'var(--accent-green)' : 'var(--border)'}`,
              }}>
                <span style={{ color: isActive ? 'var(--accent-gold)' : 'var(--text-secondary)' }}>{label}</span>
                <span style={{ color: full ? '#e03939' : isTree ? 'var(--accent-green)' : 'var(--text-primary)', fontWeight:700 }}>
                  {f}/{c}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Residual info */}
      <div style={{
        padding:'8px 12px', borderRadius:8, fontSize:12,
        background:'#5B9BD518', border:'1px solid #5B9BD5',
        color:'var(--text-primary)',
      }}>
        <span style={{ fontWeight:700, color:'#5B9BD5' }}>רשת שיורית: </span>
        לכל קשת (u,v) עם זרם f: קיבולת שיורית קדימה = c-f, קיבולת שיורית אחורה = f.
        BFS/DFS מוצא נתיבים ב-O(E) בכל חזרה. סה"כ O(E·|f*|).
      </div>

      <AnimationControls
        step={anim.step} totalSteps={STEPS.length}
        playing={anim.playing} speed={anim.speed}
        canPrev={anim.canPrev} canNext={anim.canNext}
        onPrev={anim.prev} onNext={anim.next}
        onReset={anim.reset} onTogglePlay={anim.togglePlay}
        onSpeedChange={anim.setSpeed}
      />
    </div>
  );
}
