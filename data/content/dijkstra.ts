import { AlgorithmContent } from '@/types';

const dijkstra: AlgorithmContent = {
  slug: 'dijkstra',
  title: 'Dijkstra',
  goal: 'מוצא מסלולים קלים ביותר ממקור s לכל שאר הצמתים. עובד על גרפים עם משקלים לא-שליליים.',
  input: 'גרף G=(V,E), משקל w≥0, צומת מקור s',
  output: 'd[v], π[v] לכל v',
  pseudocode: `RELAX(u, v, w):
  if v.d > u.d + w(u,v):
    v.d = u.d + w(u,v)
    v.π = u

DIJKSTRA(G, w, s):
  INITIALIZE-SINGLE-SOURCE(G, s)  // d[v]=∞, d[s]=0, π=NIL
  S = ∅
  Q = min-priority-queue(G.V)
  while Q ≠ ∅:
    u = EXTRACT-MIN(Q)
    S = S ∪ {u}
    for each v ∈ G.Adj[u]:
      RELAX(u, v, w)`,
  notes: [
    'אינו עובד עם קשתות שליליות',
    'חמדני — ברגע שצומת יוצא מהתור: d[u] = δ(s,u) סופי ומינימלי',
    'BFS = Dijkstra כאשר כל המשקלים שווים ל-1',
    'E פעולות RELAX × O(log V) לעדכון heap = O(E log V)',
  ],
  timeComplexity: 'O(E log V)',
  spaceComplexity: 'O(V)',
  questions: [
    {
      q: 'מדוע Dijkstra לא עובד עם קשתות שליליות?',
      options: [
        'בגלל מבנה הנתונים',
        'כי ברגע שצומת יוצא מהתור הוא נחשב סופי ולא יחזור',
        'בגלל מיון הקשתות',
        'בגלל זמן ריצה',
      ],
      correct: 1,
      explanation:
        'Dijkstra מניח שהוספת קשת לא תקצר מסלול שכבר "נסגר". קשת שלילית שוברת הנחה זו.',
    },
    {
      q: 'מה RELAX עושה?',
      options: [
        'מוחקת קשתות כבדות',
        'ממיינת שכנים',
        'בודקת אם מסלול דרך u קצר יותר ל-v ומעדכנת אם כן',
        'מוסיפה v לעץ MST',
      ],
      correct: 2,
      explanation: 'if d[v] > d[u] + w(u,v): עדכן d[v] ו-π[v].',
    },
    {
      q: 'מהו זמן הריצה עם min-heap?',
      options: ['O(V²)', 'O(V+E)', 'O(E log V)', 'O(VE)'],
      correct: 2,
      explanation: 'E פעולות RELAX × O(log V) לעדכון heap.',
    },
    {
      q: 'מה מבדיל Dijkstra מ-BFS?',
      options: [
        'BFS עובד על גרפים מכוונים, Dijkstra לא',
        'Dijkstra מטפל במשקלים שונים, BFS מניח משקל 1',
        'BFS מהיר יותר תמיד',
        'אין הבדל מהותי',
      ],
      correct: 1,
      explanation: 'BFS = Dijkstra כאשר כל המשקלים שווים ל-1.',
    },
    {
      q: 'מה מתקיים ברגע שצומת u נכנס לקבוצה S?',
      options: ['d[u] = 0', 'd[u] = δ(s,u) — המרחק המינימלי הסופי', 'u.π = NIL', 'd[u] = ∞'],
      correct: 1,
      explanation:
        'תכונת הנכונות של Dijkstra: ברגע שצומת יוצא מהתור — המרחק שלו סופי ומינימלי.',
    },
    {
      q: 'אם יש קשת שלילית אחת שיוצאת מ-s ואין מעגלים שליליים — האם ניתן להשתמש ב-Dijkstra?',
      options: [
        'לא, לעולם לא',
        'כן, במקרה הזה',
        'רק אם מוסיפים קבוע לכל הקשתות',
        'רק אם הגרף לא-מכוון',
      ],
      correct: 1,
      explanation:
        'אם הקשת השלילית יוצאת מ-s ואין מעגל שלילי — ניתן. אם יוצאת מצומת אחר — לא.',
    },
  ],
};

export default dijkstra;
