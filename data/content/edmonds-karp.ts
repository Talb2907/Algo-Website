import { AlgorithmContent } from '@/types';

const edmondsKarp: AlgorithmContent = {
  slug: 'edmonds-karp',
  title: 'Edmonds-Karp',
  goal: 'וריאנט של Ford-Fulkerson שמשתמש ב-BFS למציאת מסלול השיפור — מבטיח זמן ריצה פולינומי.',
  input: 'רשת זרימה G, קיבולות c, מקור s, יעד t',
  output: 'f — פונקציית זרימה מקסימלית',
  pseudocode: `EDMONDS-KARP(G, s, t):
  for each (u,v) ∈ G.E:
    f(u,v) = 0
    f(v,u) = 0
  while ∃ מסלול p מ-s ל-t ב-Gf  // BFS!
    cf(p) = min{cf(u,v) : (u,v) ∈ p}
    for each (u,v) ∈ p:
      if (u,v) ∈ E:  f(u,v) += cf(p)
      else:          f(v,u) -= cf(p)
  return f

// ההבדל היחיד מ-FF: BFS במקום DFS/כלשהו`,
  notes: [
    'זהה ל-Ford-Fulkerson אבל בוחר מסלול קצר ביותר (BFS)',
    'מבטיח O(VE²) ללא תלות בערכי הקיבולות',
    'Ford-Fulkerson עם DFS: O(E·|f*|) — תלוי בערכים',
    'מספר האיטרציות ≤ O(VE)',
    'כל BFS עולה O(E)',
  ],
  timeComplexity: 'O(VE²)',
  spaceComplexity: 'O(V)',
  questions: [
    {
      q: 'מה ההבדל בין Edmonds-Karp ל-Ford-Fulkerson?',
      options: [
        'EK עובד על גרפים לא מכוונים בלבד',
        'EK משתמש ב-BFS למציאת מסלול השיפור',
        'EK מהיר יותר תמיד',
        'אין הבדל מהותי',
      ],
      correct: 1,
      explanation: 'EK = FF + BFS. מבחר המסלול הקצר ביותר מבטיח O(VE²).',
    },
    {
      q: 'מדוע EK עדיף על FF עם DFS?',
      options: [
        'כי BFS מהיר יותר מ-DFS',
        'כי EK מבטיח זמן פולינומי ללא תלות בערכי הקיבולות',
        'כי EK משתמש בפחות זיכרון',
        'כי EK עובד על גרפים גדולים יותר',
      ],
      correct: 1,
      explanation:
        'FF עם DFS: O(E·|f*|) — אם |f*| גדול → איטי. EK: O(VE²) — תמיד פולינומי.',
    },
    {
      q: 'מהו זמן הריצה של Edmonds-Karp?',
      options: ['O(VE)', 'O(E|f*|)', 'O(VE²)', 'O(V²E)'],
      correct: 2,
      explanation: 'O(VE) איטרציות × O(E) לכל BFS = O(VE²).',
    },
  ],
};

export default edmondsKarp;
