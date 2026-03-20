import { AlgorithmContent } from '@/types';

const astar: AlgorithmContent = {
  slug: 'astar',
  title: 'A*',
  goal: 'מוצא מסלול קצר ממקור s ליעד t תוך שימוש ב-heuristic להאצת החיפוש.',
  input: 'גרף G, משקל w≥0, מקור s, יעד t, פונקציית הערכה h(v)',
  output: 'מסלול קצר מ-s ל-t',
  pseudocode: `A-STAR(G, s, t, h):
  // f(v) = g(v) + h(v)
  // g(v) = מרחק אמיתי מ-s ל-v
  // h(v) = הערכת מרחק מ-v ל-t (heuristic)
  INITIALIZE: g[s]=0, f[s]=h(s), Q=min-heap
  while Q ≠ ∅:
    u = EXTRACT-MIN(Q)  // לפי f[u]
    if u == t: return המסלול
    for each v ∈ G.Adj[u]:
      g_new = g[u] + w(u,v)
      if g_new < g[v]:
        g[v] = g_new
        f[v] = g[v] + h(v)
        v.π = u
        INSERT/UPDATE(Q, v)`,
  notes: [
    'h(v) קביל: h(v) ≤ δ(v,t) — לא מעריכה יתר על המידה',
    'h(v) עקבי: h(u) ≤ w(u,v) + h(v) — מבטיח אופטימליות',
    'h(v) = 0 → Dijkstra רגיל',
    'h(v) = מרחק אוירי — קביל לגרפי מפות',
    'זמן ריצה תלוי באיכות h(v)',
  ],
  timeComplexity: 'תלוי ב-h(v)',
  spaceComplexity: 'O(V)',
  questions: [
    {
      q: 'מה מייצג f(v) ב-A*?',
      options: [
        'מרחק אמיתי מ-s ל-v',
        'הערכת מרחק מ-v ל-t',
        'סכום מרחק אמיתי מ-s + הערכה ל-t',
        'משקל הקשת',
      ],
      correct: 2,
      explanation: 'f(v) = g(v) + h(v) = עלות אמיתית מ-s + הערכה ל-t.',
    },
    {
      q: 'מתי A* זהה ל-Dijkstra?',
      options: ['כאשר h(v) = ∞', 'כאשר h(v) = 0', 'כאשר h(v) = g(v)', 'תמיד'],
      correct: 1,
      explanation: 'h(v) = 0 → f(v) = g(v) → בדיוק Dijkstra.',
    },
    {
      q: 'מה תנאי הקבילות (admissibility) של h?',
      options: [
        'h(v) ≥ δ(v,t)',
        'h(v) = δ(v,t)',
        'h(v) ≤ δ(v,t)',
        'h(v) > 0 תמיד',
      ],
      correct: 2,
      explanation: 'h קבילה = לא מעריכה יתר. h(v) ≤ מרחק אמיתי מ-v ל-t.',
    },
  ],
};

export default astar;
