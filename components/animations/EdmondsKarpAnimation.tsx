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
  bfsQueue: string[];
  bfsVisited: string[];
  path: string;
  bottleneck: number | null;
  pathNum: number;
  info: string;
}

const mk = (
  ns: NS, es: ES,
  flow: Flw, totalFlow: number,
  bfsQueue: string[], bfsVisited: string[],
  path: string, bottleneck: number | null,
  pathNum: number, info: string
): Step => ({ ns, es, flow, totalFlow, bfsQueue, bfsVisited, path, bottleneck, pathNum, info });

const CAP: Record<string, number> = {
  's->a':16, 's->c':13,
  'a->b':12, 'a->c':10,
  'c->a':4,
  'b->t':20,
  'c->d':14,
  'd->b':7, 'd->t':4,
};

const F0: Flw = { 's->a':0,'s->c':0,'a->b':0,'a->c':0,'c->a':0,'b->t':0,'c->d':0,'d->b':0,'d->t':0 };
const SRC: NS = { s:'black', a:'white', b:'white', c:'white', d:'white', t:'white' };

const STEPS: Step[] = [
  mk(SRC, {}, F0, 0, [], [], '', null, 0,
    'אדמונדס-קארפ: כמו פורד-פולקרסון אך משתמש ב-BFS למציאת נתיב מגדיל הקצר ביותר (מינימום קשתות). מורכבות: O(VE²).'),

  // Path 1: BFS exploration
  mk({ ...SRC, a:'gray', c:'gray' },
    { 's->a':'active', 's->c':'active' },
    F0, 0, ['a','c'], ['s','a','c'], '', null, 1,
    'BFS רמה 1 מ-s: גלה {a, c}. תור BFS: [a, c].'),

  mk({ ...SRC, a:'gray', b:'gray', c:'gray', d:'gray' },
    { 's->a':'active', 's->c':'active', 'a->b':'active', 'c->d':'active' },
    F0, 0, ['b','d'], ['s','a','c','b','d'], '', null, 1,
    'BFS רמה 2: מ-a גלה {b}, מ-c גלה {d}. (c→a כבר ביקרנו). תור BFS: [b, d].'),

  mk({ ...SRC, a:'gray', b:'gray', c:'gray', d:'gray', t:'gray' },
    { 's->a':'active', 'a->b':'active', 'b->t':'active' },
    F0, 0, ['t'], ['s','a','c','b','d','t'], 's → a → b → t', 12, 1,
    'BFS רמה 3: מ-b גלה {t}! נמצא נתיב קצר ביותר (3 קשתות): s→a→b→t. צוואר הבקבוק=min(16,12,20)=12.'),

  mk({ ...SRC, a:'black', b:'black', t:'black' },
    { 's->a':'tree', 'a->b':'tree', 'b->t':'tree' },
    { ...F0, 's->a':12, 'a->b':12, 'b->t':12 }, 12,
    [], [], 's → a → b → t', null, 1,
    'שלח 12 יחידות ב-s→a→b→t. f[s→a]=12/16, f[a→b]=12/12, f[b→t]=12/20. זרם כולל=12.'),

  // Path 2: BFS
  mk({ ...SRC, c:'gray', d:'gray', t:'black' },
    { 's->a':'tree', 'a->b':'tree', 'b->t':'tree', 's->c':'active', 'c->d':'active', 'd->t':'active' },
    { ...F0, 's->a':12, 'a->b':12, 'b->t':12 }, 12,
    ['c','d','t'], ['s','c','d','t'], 's → c → d → t', 4, 2,
    'BFS נתיב 2: s→c→d→t (3 קשתות). קיבולת שיורית: s→c=13, c→d=14, d→t=4. צוואר=4.'),

  mk({ ...SRC, c:'black', d:'black', t:'black' },
    { 's->a':'tree', 'a->b':'tree', 'b->t':'tree', 's->c':'tree', 'c->d':'tree', 'd->t':'tree' },
    { ...F0, 's->a':12, 's->c':4, 'a->b':12, 'b->t':12, 'c->d':4, 'd->t':4 }, 16,
    [], [], 's → c → d → t', null, 2,
    'שלח 4 יחידות. f[s→c]=4/13, f[c→d]=4/14, f[d→t]=4/4 (מלא!). זרם כולל=16.'),

  // Path 3: BFS — uses residual edge d→b (since d→t is full)
  mk({ ...SRC, c:'gray', d:'gray', b:'gray', t:'black' },
    { 's->a':'tree', 'a->b':'tree', 'b->t':'tree', 's->c':'active', 'c->d':'active', 'd->b':'active', 'd->t':'rejected', 'b->t':'active' },
    { ...F0, 's->a':12, 's->c':4, 'a->b':12, 'b->t':12, 'c->d':4, 'd->t':4 }, 16,
    ['c','d','b','t'], ['s','c','d','b','t'],
    's → c → d → b → t', 7, 3,
    'BFS נתיב 3: s→c→d→b→t (4 קשתות). d→t מלא! BFS מוצא נתיב עם d→b. צוואר=min(9,10,7,8)=7.'),

  mk({ s:'black', a:'black', b:'black', c:'black', d:'black', t:'black' },
    { 's->a':'tree', 'a->b':'tree', 'b->t':'tree', 's->c':'tree', 'c->d':'tree', 'd->b':'tree', 'd->t':'tree' },
    { 's->a':12, 's->c':11, 'a->b':12, 'a->c':0, 'c->a':0, 'b->t':19, 'c->d':11, 'd->b':7, 'd->t':4 }, 23,
    [], [], '', null, 3,
    'שלח 7. f[s→c]=11, f[d→b]=7, f[b→t]=19. זרם כולל=23.'),

  mk({ s:'black', a:'black', b:'black', c:'black', d:'black', t:'black' },
    { 's->a':'tree', 'a->b':'tree', 'b->t':'tree', 's->c':'tree', 'c->d':'tree', 'd->b':'tree', 'd->t':'tree' },
    { 's->a':12, 's->c':11, 'a->b':12, 'a->c':0, 'c->a':0, 'b->t':19, 'c->d':11, 'd->b':7, 'd->t':4 }, 23,
    [], [], '', null, 0,
    '✓ BFS לא מצא נתיב מגדיל — הגיע לסיום! זרם מקסימלי=23. אדמונדס-קארפ: O(VE²)=O(6·81)=O(486) — פולינומי!'),
];

const EDGE_LIST = [
  { key:'s->a', label:'s→a' }, { key:'s->c', label:'s→c' },
  { key:'a->b', label:'a→b' }, { key:'a->c', label:'a→c' },
  { key:'c->a', label:'c→a' }, { key:'b->t', label:'b→t' },
  { key:'c->d', label:'c→d' }, { key:'d->b', label:'d→b' },
  { key:'d->t', label:'d→t' },
];

export default function EdmondsKarpAnimation() {
  const anim = useAnimation(STEPS.length);
  const s = STEPS[anim.step];

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
      {/* Header: path counter + flow */}
      <div style={{ display:'flex', gap:10 }}>
        <div style={{
          flex:1, padding:'8px 14px', borderRadius:8, textAlign:'center',
          background:'#7F77DD18', border:'1px solid var(--accent-purple)',
        }}>
          <div style={{ fontSize:11, color:'var(--text-secondary)' }}>נתיב BFS</div>
          <div style={{ fontSize:18, fontWeight:800, fontFamily:'monospace', color:'var(--accent-purple)' }}>
            {s.pathNum === 0 ? '—' : s.pathNum} / 3
          </div>
        </div>
        <div style={{
          flex:1, padding:'8px 14px', borderRadius:8, textAlign:'center',
          background: s.totalFlow >= 23 ? '#1D9E7520' : '#EF9F2718',
          border: `1px solid ${s.totalFlow >= 23 ? 'var(--accent-green)' : 'var(--accent-gold)'}`,
        }}>
          <div style={{ fontSize:11, color:'var(--text-secondary)' }}>זרם כולל</div>
          <div style={{ fontSize:18, fontWeight:800, fontFamily:'monospace',
            color: s.totalFlow >= 23 ? 'var(--accent-green)' : 'var(--accent-gold)' }}>
            {s.totalFlow} / 23
          </div>
        </div>
        {s.bottleneck !== null && (
          <div style={{
            flex:1, padding:'8px 14px', borderRadius:8, textAlign:'center',
            background:'#EF9F2718', border:'1px solid var(--accent-gold)',
          }}>
            <div style={{ fontSize:11, color:'var(--text-secondary)' }}>צוואר הבקבוק</div>
            <div style={{ fontSize:18, fontWeight:800, fontFamily:'monospace', color:'var(--accent-gold)' }}>
              {s.bottleneck}
            </div>
          </div>
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
            נתיב BFS: {s.path}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="rounded-lg px-4 py-3 text-sm"
        style={{ background:'var(--bg-card)', border:'1px solid var(--accent-purple)', color:'var(--text-primary)', minHeight:44, lineHeight:1.6 }}>
        <span style={{ color:'var(--accent-purple)', fontWeight:700, marginLeft:6 }}>שלב {anim.step+1}:</span>
        {s.info}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
        {/* BFS queue */}
        <div className="rounded-lg p-3" style={{ background:'var(--bg-card)', border:'1px solid var(--border)' }}>
          <div style={{ fontSize:11, color:'var(--text-secondary)', fontWeight:600, marginBottom:6 }}>
            תור BFS (גילוי לפי רמות)
          </div>
          {s.bfsVisited.length === 0
            ? <span style={{ fontSize:12, color:'var(--text-secondary)' }}>—</span>
            : <div style={{ display:'flex', gap:4, flexWrap:'wrap', alignItems:'center' }}>
                {s.bfsVisited.map((n, i) => (
                  <span key={i} style={{ display:'flex', alignItems:'center', gap:3 }}>
                    <span style={{
                      padding:'2px 8px', borderRadius:4, fontSize:12, fontFamily:'monospace', fontWeight:700,
                      background: s.bfsQueue.includes(n) ? '#EF9F2720' : '#1D9E7518',
                      border: `1px solid ${s.bfsQueue.includes(n) ? 'var(--accent-gold)' : 'var(--accent-green)'}`,
                      color: s.bfsQueue.includes(n) ? 'var(--accent-gold)' : 'var(--accent-green)',
                    }}>{n}</span>
                    {i < s.bfsVisited.length-1 && <span style={{ color:'var(--border)', fontSize:10 }}>→</span>}
                  </span>
                ))}
              </div>
          }
        </div>

        {/* Flow table */}
        <div className="rounded-lg p-3" style={{ background:'var(--bg-card)', border:'1px solid var(--border)' }}>
          <div style={{ fontSize:11, color:'var(--text-secondary)', fontWeight:600, marginBottom:6 }}>
            זרם / קיבולת
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:3 }}>
            {EDGE_LIST.map(({ key, label }) => {
              const f = s.flow[key] ?? 0;
              const c = CAP[key];
              const isActive = s.es[key] === 'active';
              const isTree = s.es[key] === 'tree';
              const full = f === c && c > 0;
              return (
                <div key={key} style={{
                  display:'flex', justifyContent:'space-between',
                  padding:'2px 6px', borderRadius:3, fontSize:11, fontFamily:'monospace',
                  border: `1px solid ${isActive ? 'var(--accent-gold)' : isTree ? 'var(--accent-green)' : 'var(--border)'}`,
                  background: isActive ? '#EF9F2710' : 'transparent',
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
      </div>

      {/* BFS vs DFS comparison */}
      <div style={{ padding:'8px 12px', borderRadius:8, fontSize:12,
        background:'#1D9E7518', border:'1px solid var(--accent-green)', color:'var(--text-primary)' }}>
        <span style={{ fontWeight:700, color:'var(--accent-green)' }}>יתרון BFS: </span>
        פורד-פולקרסון עם DFS עשוי לבחור נתיבים ארוכים → O(E·|f*|) שאינו פולינומי. BFS תמיד בוחר הקצר ביותר → מבטיח O(VE²).
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
