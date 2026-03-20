import { AlgorithmContent } from '@/types';

const dagSp: AlgorithmContent = {
  slug: 'dag-sp',
  title: 'DAG Shortest Paths',
  goal: 'מוצא מסלולים קלים ממקור s ב-DAG — מהיר יותר מ-Bellman-Ford, עובד גם עם משקלים שליליים.',
  input: 'DAG G=(V,E), משקל w (כולל שליליים), צומת s',
  output: 'd[v], π[v] לכל v',
  pseudocode: `DAG-SHORTEST-PATHS(G, w, s):
  // שלב 1: מיון טופולוגי של G
  TOPOLOGICALLY-SORT(G)
  // שלב 2: אתחול
  INITIALIZE-SINGLE-SOURCE(G, s)
  // שלב 3: RELAX לפי הסדר הטופולוגי
  for each u ∈ G.V (בסדר טופולוגי):
    for each v ∈ G.Adj[u]:
      RELAX(u, v, w)`,
  notes: [
    'דורש DAG — לא עובד על גרפים עם מעגלים',
    'עובד עם משקלים שליליים (בניגוד ל-Dijkstra)',
    'מהיר יותר מ-Bellman-Ford: O(V+E) במקום O(VE)',
    'מבוסס על: ב-DAG — כל מסלול הוא מסלול טופולוגי',
    'גם לבעיות longest path: שנה כל משקל לשלילי',
  ],
  timeComplexity: 'O(V+E)',
  spaceComplexity: 'O(V)',
  questions: [
    {
      q: 'מדוע DAG SP מהיר יותר מ-Bellman-Ford?',
      options: [
        'כי הוא משתמש ב-heap',
        'כי הוא מבצע RELAX רק פעם אחת לכל צומת',
        'כי הוא מיון טופולוגי בלבד',
        'כי הגרף קטן',
      ],
      correct: 1,
      explanation: 'ב-DAG, סדר טופולוגי מבטיח ש-RELAX מספיק פעם אחת לכל קשת.',
    },
    {
      q: 'האם DAG SP עובד עם משקלים שליליים?',
      options: [
        'לא, כמו Dijkstra',
        'כן, כי DAG לא יכיל מעגלים שליליים',
        'רק אם המשקלים גדולים מ-(-5)',
        'תלוי בגרף',
      ],
      correct: 1,
      explanation: 'DAG = ללא מעגלים → אין מעגלים שליליים → משקלים שליליים מותרים.',
    },
    {
      q: 'מה זמן הריצה של DAG SP?',
      options: ['O(VE)', 'O(E log V)', 'O(V+E)', 'O(V²)'],
      correct: 2,
      explanation: 'מיון טופולוגי O(V+E) + RELAX O(V+E) = O(V+E).',
    },
  ],
};

export default dagSp;
