import { AlgorithmContent } from '@/types';

const kruskal: AlgorithmContent = {
  slug: 'kruskal',
  title: 'Kruskal',
  goal: 'מוצא MST בגרף לא-מכוון עם משקלים, ע"י בחירת קשתות קלות תוך הימנעות ממעגלים.',
  input: 'גרף לא-מכוון G=(V,E), פונקציית משקל w',
  output: 'קבוצת קשתות A — ה-MST',
  pseudocode: `MST-KRUSKAL(G, w):
  A = ∅
  for each v ∈ G.V:  MAKE-SET(v)
  sort G.E בסדר עולה לפי w
  for each (u,v) ∈ G.E  // בסדר עולה
    if FIND-SET(u) ≠ FIND-SET(v):
      A = A ∪ {(u,v)}
      UNION(u, v)
  return A`,
  notes: [
    'משתמש ב-Union-Find (Disjoint Set Union)',
    'קשת בטוחה: הקשת הקלה של כל חתך שלא מפר A',
    'ייחודי כשכל משקלי הקשתות שונים',
    'טריק: למציאת עץ פורש מקסימלי — הכפל כל משקל ב-(-1) ואז הפעל Kruskal',
    'הצעד הדומיננטי = מיון E קשתות',
  ],
  timeComplexity: 'O(E log E)',
  spaceComplexity: 'O(V)',
  questions: [
    {
      q: 'מדוע בודקים FIND-SET(u) ≠ FIND-SET(v)?',
      options: ['לחיסכון בזמן', 'למניעת יצירת מעגל', 'למיון הקשתות', 'לבדיקת קישוריות'],
      correct: 1,
      explanation: 'u,v באותו component → הוספת הקשת תיצור מעגל.',
    },
    {
      q: 'כמה קשתות יש ב-MST לגרף עם V צמתים?',
      options: ['V', 'V-1', 'V+1', 'E'],
      correct: 1,
      explanation: 'עץ על V צמתים תמיד מכיל בדיוק V-1 קשתות.',
    },
    {
      q: 'מהו זמן הריצה של Kruskal?',
      options: ['O(V²)', 'O(E log E)', 'O(V+E)', 'O(VE)'],
      correct: 1,
      explanation: 'הצעד הדומיננטי = מיון E קשתות.',
    },
    {
      q: 'מה קורה כש-Kruskal פוגש קשת שסוגרת מעגל?',
      options: [
        'מוסיף אותה בכל זאת',
        'דוחה אותה וממשיך',
        'מחליף קשת קיימת יקרה יותר',
        'מתחיל מחדש',
      ],
      correct: 1,
      explanation: 'FIND-SET(u) == FIND-SET(v) → מעגל → דחייה.',
    },
    {
      q: 'מה ההבדל העיקרי בין Kruskal ל-Prim?',
      options: [
        'Kruskal מוצא מסלול קצר, Prim MST',
        'Prim עובד על גרפים מכוונים, Kruskal לא',
        'Kruskal בוחר קשתות גלובלית, Prim גדל מצומת אחד',
        'אין הבדל',
      ],
      correct: 2,
      explanation: 'Kruskal: ממיין כל הקשתות גלובלית. Prim: מגדיל עץ צעד אחר צעד.',
    },
    {
      q: 'מה "קשת בטוחה" (safe edge)?',
      options: [
        'קשת שאינה יוצרת מעגל',
        'קשת קלה של חתך שלא מפר את A',
        'הקשת הקלה ביותר בגרף',
        'קשת שכבר נמצאת ב-A',
      ],
      correct: 1,
      explanation: 'תיאורמת הקשת הבטוחה — בסיס ל-Kruskal ו-Prim.',
    },
    {
      q: 'אם נרצה עץ פורש עם סכום משקלות מקסימלי, מה נעשה?',
      options: [
        'נפעיל Kruskal בסדר יורד',
        'נכפיל כל משקל ב-(-1) ונפעיל Kruskal',
        'נפעיל Prim עם max-heap',
        'A ו-C נכונים',
      ],
      correct: 1,
      explanation: 'הכפלת (-1) הופכת את הבעיה למינימום.',
    },
  ],
};

export default kruskal;
