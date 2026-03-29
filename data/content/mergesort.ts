import { AlgorithmContent } from '@/types';

const mergesort: AlgorithmContent = {
  slug: 'mergesort',
  title: 'מיון מיזוג (Merge Sort)',
  goal: 'ממיין מערך באמצעות אסטרטגיית "פצל ומשול" (Divide & Conquer) — מחלק למחצית, ממיין רקורסיבית, ומאחד.',
  input: 'מערך A[1..n] של מספרים',
  output: 'מערך ממוין A[1..n] כאשר A[i] ≤ A[i+1] לכל i',
  pseudocode: `MERGE(A, p, q, r):
  // מאחד שני תת-מערכים ממוינים: A[p..q] ו-A[q+1..r]
  n₁ = q − p + 1
  n₂ = r − q
  יצירת מערכים זמניים L[1..n₁+1], R[1..n₂+1]
  for i = 1 to n₁:
    L[i] = A[p + i − 1]
  for j = 1 to n₂:
    R[j] = A[q + j]
  L[n₁+1] = ∞  // שומר סף
  R[n₂+1] = ∞
  i = 1;  j = 1
  for k = p to r:
    if L[i] ≤ R[j]:
      A[k] = L[i]
      i = i + 1
    else:
      A[k] = R[j]
      j = j + 1

MERGE-SORT(A, p, r):
  if p < r:
    q = ⌊(p + r) / 2⌋  // נקודת חלוקה
    MERGE-SORT(A, p, q)      // ממיין מחצית שמאלית
    MERGE-SORT(A, q+1, r)    // ממיין מחצית ימנית
    MERGE(A, p, q, r)        // מאחד את שני החצאים`,
  notes: [
    'יציב (Stable) — שומר על סדר יחסי של איברים שווים',
    'זמן ריצה O(n log n) גם במקרה הגרוע — לא תלוי בקלט',
    'דורש זיכרון עזר O(n) למערכים הזמניים',
    'מבוסס Divide & Conquer: T(n) = 2T(n/2) + Θ(n) = Θ(n log n)',
    'MERGE עובד ב-O(n) — כל איבר מועתק בדיוק פעמיים',
    'עומק הרקורסיה log n — מספר חלוקות עד הגעה לאיבר בודד',
    'יעיל למיון קבצים חיצוניים גדולים (External Sorting)',
    'ניתן למימוש ללא רקורסיה באמצעות Bottom-Up Merge Sort',
  ],
  timeComplexity: 'O(n log n)',
  spaceComplexity: 'O(n)',
  questions: [
    {
      q: 'מהו זמן הריצה של Merge Sort במקרה הגרוע?',
      options: ['O(n²)', 'O(n log n)', 'O(n)', 'O(log n)'],
      correct: 1,
      explanation:
        'Merge Sort תמיד מחלק למחצית (log n רמות) וכל רמה דורשת O(n) זמן למיזוג — סה״כ O(n log n).',
    },
    {
      q: 'מה המשמעות של אלגוריתם מיון יציב (Stable)?',
      options: [
        'זמן ריצה קבוע תמיד',
        'שומר על הסדר היחסי של איברים שווים',
        'לא דורש זיכרון עזר',
        'עובד רק על מספרים שלמים',
      ],
      correct: 1,
      explanation:
        'מיון יציב אומר שאם A[i]=A[j] ו-i<j לפני המיון, אז A[i] יופיע לפני A[j] גם אחרי המיון.',
    },
    {
      q: 'מדוע Merge Sort דורש O(n) זיכרון עזר?',
      options: [
        'לאחסון קריאות רקורסיביות',
        'ליצירת מערכים זמניים L ו-R בכל שלב מיזוג',
        'למניעת הרס הקלט המקורי',
        'לשיפור מהירות הגישה',
      ],
      correct: 1,
      explanation:
        'פעולת MERGE יוצרת שני מערכי עזר L ו-R בגודל כולל O(n) כדי לאחד את שני החצאים הממוינים.',
    },
    {
      q: 'כמה רמות רקורסיה יש ב-Merge Sort על מערך בגודל 64?',
      options: ['6', '7', '8', '64'],
      correct: 1,
      explanation:
        'עומק הרקורסיה הוא log₂(n). log₂(64) = 6, אבל יש רמה נוספת (רמת הבסיס) — סה״כ 7 רמות.',
    },
    {
      q: 'מה קורה בשלב הבסיס של הרקורסיה (p ≥ r)?',
      options: [
        'מתבצע מיזוג',
        'האלגוריתם מחזיר — מערך בגודל 1 כבר ממוין',
        'מתרחשת שגיאה',
        'מתבצעת חלוקה נוספת',
      ],
      correct: 1,
      explanation: 'כאשר p ≥ r, תת-המערך הוא ריק או בגודל 1 — כבר ממוין ואין צורך בפעולה.',
    },
  ],
};

export default mergesort;
