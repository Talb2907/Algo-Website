import { scrape } from '@/lib/moodle-browser';
import { extractText } from '@/lib/file-extractor';

export const dynamic = 'force-dynamic';

export async function POST() {
  const username = process.env.MOODLE_USERNAME;
  const password = process.env.MOODLE_PASSWORD;

  if (!username || !password) {
    return Response.json(
      { error: 'ההתחברות למודל נכשלה, בדקי את פרטי הגישה ב-.env.local' },
      { status: 401 }
    );
  }

  try {
    const { pageText, files } = await scrape(username, password);

    const parts: string[] = [];
    if (pageText) parts.push(pageText.slice(0, 1000));

    for (const file of files) {
      const text = await extractText(file.buffer, file.ext);
      if (text) parts.push(`[${file.name}]\n${text}`);
    }

    let content = parts.join('\n\n---\n\n');
    if (content.length > 5000) content = content.slice(0, 5000);

    return Response.json({
      content,
      fileCount: files.length,
      fileNames: files.map(f => f.name),
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : '';

    if (msg === 'LOGIN_FAILED') {
      return Response.json(
        { error: 'ההתחברות למודל נכשלה, בדקי את פרטי הגישה ב-.env.local' },
        { status: 401 }
      );
    }

    if (msg === 'COURSE_NOT_FOUND') {
      return Response.json(
        { error: 'הקורס לא נמצא במודל' },
        { status: 404 }
      );
    }

    console.error('moodle-scraper error:', msg);
    return Response.json(
      { error: 'שגיאה בטעינת חומר ממודל' },
      { status: 500 }
    );
  }
}
