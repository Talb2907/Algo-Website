import { AlgorithmContent } from '@/types';

const dfs: AlgorithmContent = {
  slug: 'dfs',
  title: 'DFS',
  goal: 'עובר על הגרף כולו, מחשב זמני גילוי (d) וסיום (f). בסיס למיון טופולוגי ו-SCC.',
  input: 'גרף G=(V,E)',
  output: 'd[v], f[v] לכל v, סיווג קשתות, יער DFS',
  pseudocode: `DFS(G):
  for each u ∈ G.V:
    u.color = WHITE;  u.π = NIL
  time = 0
  for each u ∈ G.V:
    if u.color == WHITE:
      DFS-VISIT(G, u)

DFS-VISIT(G, u):
  time = time + 1;  u.d = time;  u.color = GRAY
  for each v ∈ G.Adj[u]:
    if v.color == WHITE:
      v.π = u
      DFS-VISIT(G, v)
  u.color = BLACK
  time = time + 1;  u.f = time`,
  notes: [
    '4 סוגי קשתות בגרף מכוון: עץ, אחורה, קדימה, חוצה',
    'קשת אחורה (back edge): u→v כאשר v אב-קדמון של u → מעגל!',
    'בגרף לא-מכוון: רק קשתות עץ ואחורה',
    'Parenthesis Theorem: d[u]<d[v]<f[v]<f[u] → v צאצא של u',
    'בסיס לאלגוריתם מיון טופולוגי ו-SCC',
  ],
  timeComplexity: 'O(V+E)',
  spaceComplexity: 'O(V)',
  questions: [
    {
      q: 'מה מייצג u.f ב-DFS?',
      options: ['מרחק מהמקור', 'זמן גילוי הצומת', 'זמן סיום עיבוד הצומת', 'מספר שכנים'],
      correct: 2,
      explanation: 'u.f = finishing time — הזמן שבו u הפך שחור.',
    },
    {
      q: 'קשת אחורה (back edge) מעידה על:',
      options: ['מיון טופולוגי אפשרי', 'קיום מעגל', 'גרף קשיר', 'עץ DFS תקין'],
      correct: 1,
      explanation: 'קשת u→v כאשר v אב-קדמון של u — מעגל.',
    },
    {
      q: 'כמה סוגי קשתות ב-DFS על גרף מכוון?',
      options: ['2', '3', '4', '5'],
      correct: 2,
      explanation: 'עץ, אחורה, קדימה, חוצה.',
    },
    {
      q: 'בגרף לא-מכוון, אילו קשתות מופיעות ב-DFS?',
      options: [
        'עץ ואחורה בלבד',
        'עץ וקדימה בלבד',
        'כל 4 הסוגים',
        'רק קשתות עץ',
      ],
      correct: 0,
      explanation: 'בגרף לא-מכוון אין קשתות קדימה או חוצה.',
    },
    {
      q: 'מה ניתן להסיק מ-d[u]<d[v]<f[v]<f[u]?',
      options: [
        'v ו-u באותו רכיב קשיר',
        'v הוא צאצא של u בעץ DFS',
        'u ו-v על אותו מסלול קצר',
        'קיים מעגל דרך u ו-v',
      ],
      correct: 1,
      explanation: 'Parenthesis Theorem — רווח v מוכל ברווח u → v צאצא של u.',
    },
    {
      q: 'כיצד מזהים קשת חוצה (cross edge) לפי זמנים?',
      options: [
        'd[u] < d[v] < f[v] < f[u]',
        'd[v] < f[v] < d[u] < f[u]',
        'd[v] < d[u] < f[u] < f[v]',
        'd[u] = d[v]',
      ],
      correct: 1,
      explanation: 'קשת חוצה = v כבר הסתיים לגמרי לפני ש-u התחיל.',
    },
    {
      q: 'כמה עצי DFS יש ב-DFS-Forest אם הגרף הלא-מכוון מכיל 3 רכיבים קשירים?',
      options: ['1', '2', '3', 'תלוי במספר הצמתים'],
      correct: 2,
      explanation: 'כל הפעלה של DFS-VISIT מרכיב שטרם נבדק = עץ חדש. 3 רכיבים = 3 עצים.',
    },
    {
      q: 'מה זמן הסיום של הצומת הראשון שנגלה ברכיב הראשון?',
      options: ['תמיד הקטן ביותר', 'תמיד הגדול ביותר', 'תלוי בגרף', 'שווה לזמן הגילוי שלו'],
      correct: 1,
      explanation:
        'הצומת הראשון שנגלה ברכיב יסיים אחרון — כי DFS-VISIT יסיים רק אחרי שחזר מכל הצאצאים.',
    },
  ],
};

export default dfs;
