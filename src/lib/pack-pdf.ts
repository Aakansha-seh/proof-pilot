import type { SavedAudit, EvidencePackResponse } from "@/lib/schemas";
import { CATEGORY_LABEL, EVIDENCE_LABEL } from "@/lib/claim-meta";

/** Generate a clean, multi-page PDF of the Evidence Pack using jsPDF. */
export async function exportPackPdf(
  audit: SavedAudit,
  pack: EvidencePackResponse
) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const M = 48;
  let y = M;

  const ink = (r: number, g: number, b: number) => doc.setTextColor(r, g, b);
  const ensure = (h: number) => {
    if (y + h > H - M) {
      doc.addPage();
      y = M;
    }
  };
  const para = (text: string, size = 10, color: [number, number, number] = [40, 40, 45], gap = 6) => {
    doc.setFontSize(size);
    ink(...color);
    const lines = doc.splitTextToSize(text, W - M * 2);
    ensure(lines.length * (size + 3));
    doc.text(lines, M, y);
    y += lines.length * (size + 3) + gap;
  };
  const heading = (text: string) => {
    y += 6;
    ensure(24);
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    ink(20, 24, 32);
    doc.text(text, M, y);
    doc.setFont("helvetica", "normal");
    y += 8;
    doc.setDrawColor(220, 224, 230);
    doc.line(M, y, W - M, y);
    y += 14;
  };

  // Header
  doc.setFillColor(37, 99, 235);
  doc.rect(0, 0, W, 8, "F");
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  ink(17, 24, 39);
  doc.text("ProofPilot Evidence Pack", M, y + 12);
  doc.setFont("helvetica", "normal");
  y += 30;
  doc.setFontSize(10);
  ink(110, 116, 128);
  doc.text(
    `${audit.title}  ·  ${new Date(audit.createdAt).toLocaleDateString()}  ·  Provider: ${audit.providerUsed.toUpperCase()}`,
    M,
    y
  );
  y += 10;

  // Score band
  y += 12;
  ensure(60);
  doc.setFillColor(245, 247, 250);
  doc.roundedRect(M, y, W - M * 2, 54, 8, 8, "F");
  doc.setFontSize(28);
  doc.setFont("helvetica", "bold");
  const score = audit.audit.overall_credibility_score;
  ink(score >= 70 ? 22 : score >= 45 ? 180 : 200, score >= 70 ? 163 : score >= 45 ? 120 : 40, score >= 70 ? 74 : 20);
  doc.text(String(score), M + 20, y + 36);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  ink(90, 96, 108);
  doc.text("/ 100 Overall Credibility Score", M + 70, y + 30);
  doc.text(`${audit.audit.claims.length} claims analyzed`, M + 70, y + 44);
  y += 74;

  heading("Executive Summary");
  para(pack.executive_summary);

  heading("Evidence Gap Analysis");
  para(pack.evidence_gap_analysis);

  heading("Claim-by-Claim Analysis");
  audit.audit.claims.forEach((c, i) => {
    ensure(60);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    ink(20, 24, 32);
    const title = doc.splitTextToSize(`${i + 1}. ${c.claim_text}`, W - M * 2);
    doc.text(title, M, y);
    y += title.length * 13 + 2;
    doc.setFont("helvetica", "normal");
    para(
      `Category: ${CATEGORY_LABEL[c.claim_category]}  |  Risk: ${c.risk_level}  |  Evidence: ${EVIDENCE_LABEL[c.evidence_status]}`,
      9,
      [120, 126, 138],
      2
    );
    para(`Why it matters: ${c.why_it_matters}`, 9, [70, 76, 88], 2);
    para(`Credible rewrite: ${c.credible_rewrite}`, 9, [22, 120, 90], 8);
  });

  heading("Validation Roadmap");
  pack.validation_roadmap.forEach((r) => {
    para(`[${r.timeframe}] ${r.action}  —  Metric: ${r.metric}`, 9, [60, 66, 78], 4);
  });

  heading("Next 7 Days");
  pack.next_7_days.forEach((n, i) => para(`${i + 1}. ${n}`, 9, [60, 66, 78], 4));

  if (audit.rewrittenPitch) {
    heading("Credible Rewritten Pitch");
    para(audit.rewrittenPitch, 10, [40, 40, 45]);
  }

  const evidenceNotes = audit.evidenceItems.filter(
    (e) => e.note || e.evidenceSummary || e.url
  );
  if (evidenceNotes.length) {
    heading("Attached Evidence Notes");
    evidenceNotes.forEach((e) =>
      para(
        `• [${e.status.replace(/_/g, " ")}] ${e.note || e.evidenceSummary || e.url}`,
        9,
        [60, 66, 78],
        3
      )
    );
  }

  // Footer disclaimer
  ensure(40);
  y = H - M - 10;
  doc.setFontSize(8);
  ink(150, 154, 164);
  const disc = doc.splitTextToSize(
    "ProofPilot helps identify evidence gaps and risky language. Users should independently verify legal, medical, financial, and other high-stakes claims.",
    W - M * 2
  );
  doc.text(disc, M, y);

  doc.save(`${audit.title.replace(/[^\w-]+/g, "_")}_EvidencePack.pdf`);
}
