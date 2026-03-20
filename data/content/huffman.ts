import { AlgorithmContent } from '@/types';

const huffman: AlgorithmContent = {
  slug: 'huffman',
  title: 'קוד הופמן',
  goal: 'דחיסת נתונים ע"י הקצאת קוד קצר לתווים שכיחים. קוד prefix-free אופטימלי.',
  input: 'קבוצת תווים C עם תדירויות',
  output: 'עץ ההדחסה',
  pseudocode: `HUFFMAN(C):
  n = |C|
  Q = min-priority-queue(C)
  for i = 1 to n-1:
    z = ALLOCATE-NODE()
    x = z.left  = EXTRACT-MIN(Q)
    y = z.right = EXTRACT-MIN(Q)
    z.freq = x.freq + y.freq
    INSERT(Q, z)
  return EXTRACT-MIN(Q)`,
  notes: [
    'n-1 איטרציות → |C|-1 צמתים פנימיים',
    'Fixed-Length Code: כל תו = ⌈log₂n⌉ ביטים — לא אופטימלי',
    'prefix-free: שום קוד אינו prefix של קוד אחר → פענוח חד-משמעי',
    'גודל הטקסט המקודד: Σ f(c)·d_T(c)',
    'העץ האופטימלי = בינארי מלא (כל צומת: 0 או 2 בנים)',
  ],
  timeComplexity: 'O(n log n)',
  spaceComplexity: 'O(n)',
  questions: [
    {
      q: 'מה מטרת קוד הופמן?',
      options: [
        'מיון מחרוזות',
        'דחיסה ע"י הקצאת קוד קצר לתווים שכיחים',
        'הצפנת טקסט',
        'מציאת מסלולים בגרף',
      ],
      correct: 1,
      explanation: 'תווים שכיחים = קוד קצר → הטקסט הכולל קצר יותר.',
    },
    {
      q: 'מה ההבדל בין Fixed-Length לקוד הופמן?',
      options: [
        'Fixed-Length מהיר יותר',
        'Fixed-Length לא מתחשב בתדירות → לא אופטימלי',
        'הופמן עובד רק על קבצים בינאריים',
        'אין הבדל',
      ],
      correct: 1,
      explanation: 'Fixed-Length = אותו מספר ביטים לכל תו ללא קשר לתדירות.',
    },
    {
      q: 'כמה איטרציות מבצע הופמן לn תווים?',
      options: ['n', 'n-1', 'n²', 'log(n)'],
      correct: 1,
      explanation: 'בכל איטרציה מורידים 2, מוסיפים 1 → n-1 איטרציות.',
    },
    {
      q: 'מהו זמן הריצה?',
      options: ['O(n)', 'O(n²)', 'O(n log n)', 'O(n log² n)'],
      correct: 2,
      explanation: 'n-1 איטרציות × O(log n) לפעולות heap.',
    },
    {
      q: 'מה תכונת prefix-free אומרת?',
      options: [
        'כל הקודים מתחילים ב-0',
        'שום קוד אינו prefix של קוד אחר',
        'הקודים ממוינים לפי תדירות',
        'כל הקודים שווי אורך',
      ],
      correct: 1,
      explanation: 'prefix-free = פענוח חד-משמעי ללא בלבול בין קודים.',
    },
    {
      q: 'מה גודל הטקסט המקודד?',
      options: [
        'n × מספר הביטים הממוצע',
        'Σ f(c) × d_T(c) — סכום (תדירות × עומק בעץ)',
        '|C| × log₂(|C|)',
        'מספר הצמתים הפנימיים בעץ',
      ],
      correct: 1,
      explanation: 'כל תו c מופיע f(c) פעמים, קוד שלו באורך d_T(c) ביטים.',
    },
    {
      q: 'מדוע העץ האופטימלי של הופמן הוא בינארי מלא?',
      options: [
        'כי min-heap מייצר תמיד עץ בינארי מלא',
        'כי צומת עם בן אחד תמיד ניתן לשיפור ע"י הסרתו',
        'כי זו דרישה של מבנה הנתונים',
        'כי מספר התווים תמיד זוגי',
      ],
      correct: 1,
      explanation:
        'אם לצומת בן אחד — ניתן להחליפו בבנו ולקצר את קוד כל הצאצאים. לכן עץ אופטימלי = בינארי מלא.',
    },
  ],
};

export default huffman;
