import { chromium, type BrowserContext } from 'playwright';

export interface MoodleFile {
  name: string;
  buffer: Buffer;
  ext: string;
}

export interface MoodleScrapeResult {
  pageText: string;
  files: MoodleFile[];
}

const FILE_EXTS = ['.pdf', '.pptx', '.docx'];
const COURSE_ID = '636017';
const MAX_FILES = 10;

function isFileLink(href: string) {
  const lower = href.toLowerCase();
  return (
    FILE_EXTS.some(ext => lower.includes(ext)) ||
    lower.includes('pluginfile.php') ||
    lower.includes('mod/resource/view.php')
  );
}

function isSubSectionLink(href: string) {
  return (
    href.includes('course/section.php') ||
    href.includes('mod/folder/view.php')
  );
}

function normalizeHref(href: string) {
  // Strip fragments and minor variants to deduplicate
  return href.split('#')[0].split('&forceview')[0].split('&lang=')[0];
}

async function collectLinks(context: BrowserContext, url: string) {
  const page = await context.newPage();
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
    return await page.evaluate(() =>
      Array.from(document.querySelectorAll('a[href]')).map(a => ({
        href: (a as HTMLAnchorElement).href,
        name: (a.textContent ?? '').trim() || (a as HTMLAnchorElement).href.split('/').pop() || 'file',
      }))
    );
  } catch {
    return [];
  } finally {
    await page.close();
  }
}

async function downloadFile(
  context: BrowserContext,
  href: string,
  name: string
): Promise<MoodleFile | null> {
  // For pluginfile.php or direct extension links — use fetch with cookies
  const lower = href.toLowerCase();
  const isDirectFile = FILE_EXTS.some(ext => lower.includes(ext)) || lower.includes('pluginfile.php');

  if (isDirectFile) {
    try {
      const cookies = await context.cookies();
      const cookieHeader = cookies.map(c => `${c.name}=${c.value}`).join('; ');
      const res = await fetch(href, { headers: { Cookie: cookieHeader }, redirect: 'follow' });
      if (!res.ok) return null;
      const finalUrl = res.url.toLowerCase();
      const contentDisp = res.headers.get('content-disposition') ?? '';
      const ext = FILE_EXTS.find(e => finalUrl.includes(e) || contentDisp.includes(e));
      if (!ext) return null;
      const buf = Buffer.from(await res.arrayBuffer());
      console.log('Downloaded (fetch):', name, ext);
      return { name, buffer: buf, ext };
    } catch (e) {
      console.log('Fetch download failed:', href, String(e).slice(0, 80));
      return null;
    }
  }

  // For mod/resource/view.php — navigate with Playwright and capture redirect or download
  const page = await context.newPage();
  try {
    const downloadPromise = page.waitForEvent('download', { timeout: 12000 }).catch(() => null);
    await page.goto(href, { waitUntil: 'domcontentloaded', timeout: 15000 }).catch(() => {});

    // Check if redirected to a direct file URL
    const finalUrl = page.url().toLowerCase();
    const ext = FILE_EXTS.find(e => finalUrl.includes(e));
    if (ext) {
      const cookies = await context.cookies();
      const cookieHeader = cookies.map(c => `${c.name}=${c.value}`).join('; ');
      const res = await fetch(page.url(), { headers: { Cookie: cookieHeader } });
      if (res.ok) {
        const buf = Buffer.from(await res.arrayBuffer());
        console.log('Downloaded (redirect):', name, ext);
        return { name, buffer: buf, ext };
      }
    }

    // Check for pluginfile links on the resource page
    const pageLinks = await page.evaluate(() =>
      Array.from(document.querySelectorAll('a[href]'))
        .map(a => (a as HTMLAnchorElement).href)
        .filter(h => h.includes('pluginfile.php'))
    );
    if (pageLinks.length > 0) {
      const cookies = await context.cookies();
      const cookieHeader = cookies.map(c => `${c.name}=${c.value}`).join('; ');
      const res = await fetch(pageLinks[0], { headers: { Cookie: cookieHeader }, redirect: 'follow' });
      if (res.ok) {
        const fu = res.url.toLowerCase();
        const cd = res.headers.get('content-disposition') ?? '';
        const fileExt = FILE_EXTS.find(e => fu.includes(e) || cd.includes(e));
        if (fileExt) {
          const buf = Buffer.from(await res.arrayBuffer());
          console.log('Downloaded (pluginfile on page):', name, fileExt);
          return { name, buffer: buf, ext: fileExt };
        }
      }
    }

    // Check for download event
    const dl = await downloadPromise;
    if (dl) {
      const stream = await dl.createReadStream();
      const chunks: Buffer[] = [];
      await new Promise<void>((res, rej) => {
        stream.on('data', (c: Buffer) => chunks.push(c));
        stream.on('end', res);
        stream.on('error', rej);
      });
      const dlName = dl.suggestedFilename();
      const dlExt = FILE_EXTS.find(e => dlName.toLowerCase().includes(e));
      if (dlExt) {
        console.log('Downloaded (event):', dlName);
        return { name: dlName || name, buffer: Buffer.concat(chunks), ext: dlExt };
      }
    }

    return null;
  } catch (e) {
    console.log('Playwright download failed:', href, String(e).slice(0, 80));
    return null;
  } finally {
    await page.close();
  }
}

export async function scrape(username: string, password: string): Promise<MoodleScrapeResult> {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ acceptDownloads: true });
  const page = await context.newPage();

  try {
    await page.goto('https://moodle.colman.ac.il/login/index.php', { waitUntil: 'domcontentloaded' });
    console.log('Login page URL:', page.url());

    const credTab = page.locator('a[href*="credential"], li:has-text("שם משתמש"), a:has-text("שם משתמש")').first();
    if (await credTab.count() > 0) await credTab.click();

    const userField = page.locator('#Ecom_User_ID, input[name="Ecom_User_ID"], input[name="username"]').first();
    const passField = page.locator('#Ecom_Password, input[name="Ecom_Password"], input[type="password"]').first();

    if (await userField.count() > 0) {
      await userField.fill(username);
      await passField.fill(password);
    } else {
      const inputs = page.locator('input').filter({ visible: true });
      await inputs.nth(0).fill(username);
      await inputs.nth(1).fill(password);
    }
    await page.locator('input[type="submit"], button[type="submit"], button:has-text("כניסה")').first().click();
    await page.waitForNavigation({ waitUntil: 'domcontentloaded' }).catch(() => {});

    if (page.url().includes('/login/')) throw new Error('LOGIN_FAILED');

    // Search for the course
    await page.goto(
      `https://moodle.colman.ac.il/course/search.php?search=${COURSE_ID}`,
      { waitUntil: 'domcontentloaded', timeout: 15000 }
    );

    const courseLink = page.locator(`a[href*="course/view"]:has-text("${COURSE_ID}")`).first();
    const courseLinkFallback = page.locator('a[href*="course/view"]').first();

    let courseUrl: string | null = null;
    if (await courseLink.count() > 0) courseUrl = await courseLink.getAttribute('href');
    else if (await courseLinkFallback.count() > 0) courseUrl = await courseLinkFallback.getAttribute('href');
    if (!courseUrl) throw new Error('COURSE_NOT_FOUND');

    await page.goto(courseUrl, { waitUntil: 'domcontentloaded', timeout: 20000 });
    console.log('Course URL:', page.url());

    const pageText = (await page.innerText('body')).slice(0, 1000);

    const mainLinks = await page.evaluate(() =>
      Array.from(document.querySelectorAll('a[href]')).map(a => ({
        href: (a as HTMLAnchorElement).href,
        name: (a.textContent ?? '').trim() || (a as HTMLAnchorElement).href.split('/').pop() || 'file',
      }))
    );

    // Collect file links from main page
    const seen = new Set<string>();
    const allFileLinks: { href: string; name: string }[] = [];

    const addFileLink = (href: string, name: string) => {
      const norm = normalizeHref(href);
      if (!seen.has(norm) && isFileLink(href)) {
        seen.add(norm);
        allFileLinks.push({ href, name });
      }
    };

    mainLinks.forEach(l => addFileLink(l.href, l.name));

    // Navigate into section tiles (course/section.php and mod/folder)
    const subSections = mainLinks
      .filter(l => isSubSectionLink(l.href))
      .filter((l, i, arr) => arr.findIndex(x => x.href === l.href) === i)
      .slice(0, 10);

    console.log('Sub-sections to visit:', subSections.length);

    // Fetch all sub-sections in parallel
    const subLinkResults = await Promise.all(
      subSections.map(({ href }) => collectLinks(context, href))
    );
    subLinkResults.forEach(links => links.forEach(l => addFileLink(l.href, l.name)));

    console.log('Total unique file links:', allFileLinks.length);
    allFileLinks.forEach(l => console.log(' FILE:', l.href));

    // Download files in parallel batches of 3
    const files: MoodleFile[] = [];
    for (let i = 0; i < allFileLinks.length; i += 3) {
      const batch = allFileLinks.slice(i, i + 3);
      const results = await Promise.all(batch.map(({ href, name }) => downloadFile(context, href, name)));
      for (const f of results) {
        if (f && files.length < MAX_FILES) files.push(f);
      }
      if (files.length >= MAX_FILES) break;
    }

    console.log('Files downloaded:', files.length);
    return { pageText, files };
  } finally {
    await browser.close();
  }
}
