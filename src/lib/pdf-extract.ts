// Server-side PDF text extraction using pdfjs-dist (legacy build for Node).
// Returns extracted text and page count. Detects image-only/scanned PDFs.

export type PdfExtractResult = {
  text: string;
  pageCount: number;
  imageOnly: boolean;
};

export async function extractPdfText(
  data: Uint8Array
): Promise<PdfExtractResult> {
  // Legacy build works in a Node/serverless context without a DOM.
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  // Disable the worker in Node — run on the main thread.
  (pdfjs as { GlobalWorkerOptions: { workerSrc: string } }).GlobalWorkerOptions.workerSrc = "";

  const loadingTask = pdfjs.getDocument({
    data,
    isEvalSupported: false,
    useSystemFonts: true,
  });
  const doc = await loadingTask.promise;
  const pageCount = doc.numPages;

  let text = "";
  for (let i = 1; i <= pageCount; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    const strings = content.items
      .map((it: unknown) => (it as { str?: string }).str ?? "")
      .filter(Boolean);
    text += strings.join(" ") + "\n\n";
  }

  const stripped = text.replace(/\s/g, "");
  // Heuristic: almost no selectable text across pages => scanned/image PDF.
  const imageOnly = stripped.length < Math.max(20, pageCount * 15);

  return { text, pageCount, imageOnly };
}
