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
  // pdfjs-dist v4 relies on Promise.withResolvers, which only exists on Node 22+.
  // Polyfill it so PDF parsing also works on Node 20/21 (a common cause of the
  // generic "could not process the document" error).
  const P = Promise as unknown as {
    withResolvers?: <T>() => {
      promise: Promise<T>;
      resolve: (value: T | PromiseLike<T>) => void;
      reject: (reason?: unknown) => void;
    };
  };
  if (typeof P.withResolvers !== "function") {
    P.withResolvers = function <T>() {
      let resolve!: (value: T | PromiseLike<T>) => void;
      let reject!: (reason?: unknown) => void;
      const promise = new Promise<T>((res, rej) => {
        resolve = res;
        reject = rej;
      });
      return { promise, resolve, reject };
    };
  }

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
