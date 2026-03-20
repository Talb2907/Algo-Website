import { AlgorithmContent } from '@/types';

const bellmanFord: AlgorithmContent = {
  slug: 'bellman-ford',
  title: 'Bellman-Ford',
  goal: 'מוצא מסלולים קלים ממקור s, מטפל בקשתות שליליות ומזהה מעגלים שליליים.',
  input: 'גרף G=(V,E), משקל w (יכול להיות שלילי), צומת s',
  output: 'd[v], π[v] לכל v, או FALSE אם יש מעגל שלילי',
  pseudocode: `BELLMAN-FORD(G, w, s):
  INITIALIZE-SINGLE-SOURCE(G, s)
  for i = 1 to |G.V| - 1:
    for each (u,v) ∈ G.E:
      RELAX(u, v, w)
  for each (u,v) ∈ G.E:
    if v.d > u.d + w(u,v):
      return FALSE  // יש מעגל שלילי
  return TRUE`,
  notes: [
    'V-1 sweeps מספיקים — המסלול הקצר מכיל לכל היותר V-1 קשתות',
    'Sweep נוסף שמשפר → מעגל שלילי',
    'לא יודע איפה המעגל — רק שקיים',
    'ניתן לעצור מוקדם אם sweep שלם לא שיפר כלום',
    'Bellman-Ford עובר על קשתות בסדר שרירותי (בניגוד ל-Dijkstra)',
  ],
  timeComplexity: 'O(VE)',
  spaceComplexity: 'O(V)',
  questions: [
    {
      q: 'מה היתרון של Bellman-Ford על Dijkstra?',
      options: ['מהיר יותר', 'עובד עם קשתות שליליות', 'פשוט יותר לממשות', 'עובד רק על DAG'],
      correct: 1,
      explanation: 'Bellman-Ford מטפל בקשתות שליליות ומזהה מעגלים שליליים.',
    },
    {
      q: 'כמה sweeps מבצע Bellman-Ford?',
      options: ['E פעמים', 'V-1 פעמים', 'V פעמים', 'log(V) פעמים'],
      correct: 1,
      explanation: 'המסלול הקצר מכיל לכל היותר V-1 קשתות → V-1 sweeps מספיקים.',
    },
    {
      q: 'מה מצביע על מעגל שלילי?',
      options: [
        'אם V-1 sweeps לא מספיקים',
        'אם sweep נוסף עדיין משפר מסלול',
        'אם d[v] = ∞',
        'אם הגרף לא קשיר',
      ],
      correct: 1,
      explanation: 'לאחר V-1 sweeps — אם עדיין ניתן לשפר → יש מעגל שלילי.',
    },
    {
      q: 'מהו זמן הריצה?',
      options: ['O(V log V)', 'O(E log V)', 'O(VE)', 'O(V+E)'],
      correct: 2,
      explanation: 'V-1 sweeps × E קשתות = O(VE).',
    },
    {
      q: 'מה ההבדל מבחינת סדר עיבוד הקשתות בין Bellman-Ford ל-Dijkstra?',
      options: [
        'Dijkstra עובר בסדר שרירותי, Bellman-Ford לפי משקל',
        'Bellman-Ford עובר בסדר שרירותי, Dijkstra לפי מרחק מינימלי',
        'שניהם עוברים לפי סדר הקשתות בגרף',
        'אין הבדל',
      ],
      correct: 1,
      explanation:
        'Bellman-Ford עובר על כל הקשתות בסדר שרירותי V-1 פעמים. Dijkstra חמדני — תמיד מוציא את הצומת הקרוב ביותר.',
    },
  ],
};

export default bellmanFord;
