export const MAX_EXTRACTED_CHARS = 50_000;

/**
 * Clean extracted document text: collapse whitespace, drop empty lines,
 * strip page-number noise and obvious repeated headers/footers.
 */
export function cleanExtractedText(raw: string): string {
  let text = raw.replace(/\r\n/g, "\n");

  const lines = text.split("\n").map((l) => l.trim());

  // Count line frequency to detect repeated headers/footers.
  const freq = new Map<string, number>();
  for (const l of lines) {
    if (l.length > 0 && l.length < 80) freq.set(l, (freq.get(l) ?? 0) + 1);
  }

  const cleaned = lines.filter((l) => {
    if (l.length === 0) return false;
    // Bare page numbers like "3" or "Page 3 of 10".
    if (/^\d{1,4}$/.test(l)) return false;
    if (/^page\s+\d+(\s+of\s+\d+)?$/i.test(l)) return false;
    // Repeated header/footer appearing on many pages.
    if ((freq.get(l) ?? 0) >= 4) return false;
    return true;
  });

  text = cleaned.join("\n");
  // Collapse runs of whitespace and blank lines.
  text = text.replace(/[ \t]{2,}/g, " ").replace(/\n{3,}/g, "\n\n").trim();

  if (text.length > MAX_EXTRACTED_CHARS) {
    text = text.slice(0, MAX_EXTRACTED_CHARS);
  }
  return text;
}

/** Split long text into semantic-ish chunks on paragraph boundaries. */
export function chunkText(text: string, maxLen = 12_000): string[] {
  if (text.length <= maxLen) return [text];
  const paras = text.split(/\n{2,}/);
  const chunks: string[] = [];
  let cur = "";
  for (const p of paras) {
    if ((cur + "\n\n" + p).length > maxLen && cur) {
      chunks.push(cur);
      cur = p;
    } else {
      cur = cur ? cur + "\n\n" + p : p;
    }
  }
  if (cur) chunks.push(cur);
  return chunks;
}
