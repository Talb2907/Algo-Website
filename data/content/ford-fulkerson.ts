import { AlgorithmContent } from '@/types';

const fordFulkerson: AlgorithmContent = {
  slug: 'ford-fulkerson',
  title: 'Ford-Fulkerson',
  goal: 'מוצא את הזרימה המקסימלית ברשת מ-s ל-t.',
  input: 'רשת זרימה G, קיבולות c, מקור s, יעד t',
  output: 'f — פונקציית זרימה מקסימלית',
  pseudocode: `FORD-FULKERSON(G, s, t):
  for each (u,v) ∈ G.E:
    f(u,v) = 0
    f(v,u) = 0
  while ∃ מסלול p מ-s ל-t ב-Gf:
    cf(p) = min{cf(u,v) : (u,v) ∈ p}
    for each (u,v) ∈ p:
      if (u,v) ∈ E:  f(u,v) += cf(p)
      else:          f(v,u) -= cf(p)
  return f`,
  notes: [
    'זרימה חוקית: f(u,v) ≤ c(u,v), f(u,v) = -f(v,u), שימור זרימה לכל u≠s,t',
    'ערך הזרימה: |f| = Σ f(s,v)',
    'רשת שיורית: cf(u,v) = c(u,v) - f(u,v)',
    'תיאורמת Max-Flow Min-Cut: זרימה מקסימלית = קיבולת חתך מינימלי',
    'Edmonds-Karp = FF + BFS, מבטיח O(VE²)',
    'קיבולת = 1 לכל קשת → הזרימה המקסימלית = מסלולים זרים מקסימליים',
  ],
  timeComplexity: 'O(E·|f*|)',
  spaceComplexity: 'O(V)',
  questions: [
    {
      q: 'מה מחפש Ford-Fulkerson בכל איטרציה?',
      options: [
        'מסלול קצר ביותר',
        'מסלול שיפור ברשת השיורית',
        'עץ פורש מינימלי',
        'מעגל שלילי',
      ],
      correct: 1,
      explanation:
        'בכל שלב מחפשים מסלול מ-s ל-t ברשת השיורית ומגדילים לפי קיבולת מינימלית.',
    },
    {
      q: 'מה מייצגת הרשת השיורית?',
      options: ['הגרף המקורי', 'כמה זרימה ניתן עוד להוסיף / להחזיר בכל קשת', 'עץ DFS', 'מטריצת משקלים'],
      correct: 1,
      explanation: 'cf(u,v) = c(u,v) - f(u,v). קשת הפוכה מאפשרת "ביטול" זרימה.',
    },
    {
      q: 'מה תיאורמת Max-Flow Min-Cut אומרת?',
      options: [
        'זרימה מקסימלית = V-1',
        'זרימה מקסימלית = קיבולת חתך מינימלי',
        'חתך מינימלי = MST',
        'זרימה = מספר מסלולים',
      ],
      correct: 1,
      explanation: 'הזרימה המקסימלית שווה תמיד לקיבולת החתך המינימלי.',
    },
    {
      q: 'מה ההבדל בין FF ל-Edmonds-Karp?',
      options: [
        'EK עובד על גרפים לא מכוונים',
        'EK בוחר מסלול קצר ביותר (BFS), FF בוחר כלשהו',
        'FF מהיר יותר תמיד',
        'אין הבדל',
      ],
      correct: 1,
      explanation: 'EK = FF + BFS. מבטיח O(VE²) ללא תלות בערכי הזרימה.',
    },
    {
      q: 'מה זמן הריצה של Edmonds-Karp?',
      options: ['O(VE)', 'O(E|f*|)', 'O(VE²)', 'O(V²E)'],
      correct: 2,
      explanation: 'O(VE) איטרציות × O(E) לכל BFS.',
    },
    {
      q: 'מה אילוץ שימור הזרימה אומר?',
      options: [
        'הזרימה בכל קשת ≤ הקיבולה',
        'לכל צומת u≠s,t: זרימה נכנסת = זרימה יוצאת',
        'הזרימה הכוללת = מספר הקשתות',
        'f(u,v) = f(v,u)',
      ],
      correct: 1,
      explanation: 'שימור זרימה = "מה שנכנס לצומת יוצא ממנו" — כמו חוק קירכהוף.',
    },
    {
      q: 'כיצד מוצאים מסלולים זרים בגרף (edge-disjoint paths)?',
      options: [
        'ע"י הפעלת BFS n פעמים',
        'ע"י Ford-Fulkerson כאשר כל הקיבולות = 1',
        'ע"י מיון טופולוגי',
        'ע"י Dijkstra',
      ],
      correct: 1,
      explanation:
        'קיבולת = 1 לכל קשת → הזרימה המקסימלית = מספר המסלולים הזרים המקסימלי.',
    },
  ],
};

export default fordFulkerson;
