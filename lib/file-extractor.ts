// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require('pdf-parse') as (buf: Buffer) => Promise<{ text: string }>;
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { parseOffice } = require('officeparser') as {
  parseOffice: (input: Buffer, cb: (data: string, err: Error | null) => void) => void;
};

function parseOfficeAsync(buffer: Buffer): Promise<string> {
  return new Promise((resolve) => {
    parseOffice(buffer, (data, err) => {
      if (err) resolve('');
      else resolve(data ?? '');
    });
  });
}

export async function extractText(buffer: Buffer, ext: string): Promise<string> {
  try {
    if (ext === '.pdf') {
      const result = await pdfParse(buffer);
      return result.text.slice(0, 2000);
    }

    if (['.pptx', '.docx'].includes(ext)) {
      const text = await parseOfficeAsync(buffer);
      return text.slice(0, 2000);
    }

    return '';
  } catch {
    return '';
  }
}
