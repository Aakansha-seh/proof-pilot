# ProofPilot — Turn ambitious claims into credible proof

ProofPilot is an AI-powered **Evidence Layer** for student founders, hackathon
teams, freelancers, and early-stage startups. It audits the claims inside a
pitch, report, submission, grant, or proposal — showing what is supported, what
is risky, and what to validate next — then rewrites risky language into credible
language and compiles a polished **Evidence Pack**.

Built for the **AMD Developer Hackathon ACT II · Track 3: Unicorn**.

```
Input → Claim extraction → Evidence-gap analysis → Validation plan → Credible rewrite → Evidence Pack
```

---

## Problem statement

People routinely ship pitches, project reports, hackathon submissions, grant
applications, and freelancer proposals containing exaggerated, vague,
unsupported, or risky claims. A single number you can't defend can sink a pitch.
There's no fast, structured way to see which claims are credible, which are
risky, and exactly what to do about each one.

ProofPilot closes that gap. It does **not** verify truth or fabricate evidence —
it surfaces evidence status, risk signals, and validation recommendations, then
helps you make each claim defensible.

## Target users

- Student founders and first-time entrepreneurs
- Hackathon teams preparing submissions and demos
- Freelancers writing client proposals
- Early-stage startups preparing investor or grant materials

## Key features

- **Claim extraction** across nine categories (factual, performance, market,
  user-adoption, technical, comparative, guarantee, future projection, vague
  marketing).
- **Claim Map dashboard** — a premium credibility gauge, executive summary, top
  risks, filterable claim grid, and four-bucket map (Proven, Needs Evidence,
  Risky Language, Future Validation).
- **Per-claim detail** — why it matters, evidence needed, a concrete validation
  plan (goal / method / metric / success criteria), and a credible rewrite.
- **Evidence-aware pitch rewrite** in three tones (Conservative, Balanced,
  Confident but defensible).
- **Evidence Pack** — a judge-ready report with claim-by-claim table, gap
  analysis, validation roadmap, a "Next 7 Days" plan, and one-click PDF export.
- **Guest Mode** — no signup; audits are saved in browser localStorage and can
  be reopened, renamed, duplicated, exported, and deleted.
- **Multimodal inputs** — paste text, upload PDF/TXT, or drop in a slide image.
- **Demo Mode** — pre-generated results so a live presentation never depends on
  an API being up.
- **AI provider abstraction** — NVIDIA, Fireworks, and an **AMD** production
  inference path, all selectable via environment variables.

## Architecture diagram

```
┌────────────────────────────── Next.js 15 (App Router) ──────────────────────────────┐
│                                                                                      │
│  Landing page          App shell (sidebar + header, Guest Mode)                      │
│  ─────────────         ───────────────────────────────────────                       │
│                        New Audit · Claim Map · Rewrite · Evidence Pack · My Audits    │
│                                        │                                              │
│                     Zustand store  ◄───┴──►  localStorage  (guest history, no DB)     │
│                                                                                      │
│  Route handlers (server, Node runtime)                                               │
│   /api/analyze            text → claim audit JSON                                     │
│   /api/documents/analyze  PDF/TXT → extract+clean → claim audit JSON                  │
│   /api/analyze-image      image → visible claims/metrics (multimodal)                 │
│   /api/rewrite            pitch + tone → evidence-aware rewrite                       │
│   /api/evidence-pack      audit → executive report content                           │
│                                        │                                              │
│                       ┌────────────────┴─────────────────┐                           │
│                       │      AIProvider abstraction       │                           │
│                       │  (OpenAI-compatible transport)    │                           │
│                       └───┬──────────┬───────────┬────────┘                           │
│                           │          │           │                                   │
│                     NvidiaProvider FireworksProvider AmdProvider ◄── AI_PROVIDER env  │
│                        (dev)      (final QA)   (production core)                      │
└──────────────────────────────────────────────────────────────────────────────────────┘
```

Every response is validated with **Zod**. Malformed model output is parsed,
then retried once with a JSON-repair prompt, then degraded to a friendly error
state — the UI never crashes.

## Screenshots / GIF

> Placeholders — capture from `npm run dev`:
>
> - `docs/landing.png` — hero + animated Claim Map preview
> - `docs/claim-map.gif` — running an audit → Claim Map dashboard
> - `docs/detail-panel.png` — claim detail with validation plan & rewrite
> - `docs/evidence-pack.png` — Evidence Pack + PDF export
> - `docs/demo-mode.gif` — Demo Mode guided progression

## Tech stack

Next.js 15 · TypeScript · App Router · Tailwind CSS · shadcn/ui · Framer Motion ·
Lucide · React Hook Form · Zod · Zustand · Next.js route handlers ·
`pdfjs-dist` (PDF text) · jsPDF (Evidence Pack export) · browser localStorage.

No authentication, payments, teams, or database in the hackathon MVP.

---

## Local setup

Requirements: Node 18.18+ (Node 20/22 recommended).

```bash
cd proofpilot
npm install
cp .env.example .env.local   # then fill in a provider key
npm run dev                  # http://localhost:3000
```

Production:

```bash
npm run build
npm start
```

The app runs instantly in **Guest Mode** — you can browse the UI and Demo Mode
without any keys. Live audits require one provider key (see below).

### `.env.example`

```env
AI_PROVIDER=nvidia

NVIDIA_API_KEY=
NVIDIA_BASE_URL=https://integrate.api.nvidia.com/v1
NVIDIA_MODEL=meta/llama-3.1-70b-instruct

FIREWORKS_API_KEY=
FIREWORKS_BASE_URL=https://api.fireworks.ai/inference/v1
FIREWORKS_MODEL=accounts/fireworks/models/llama-v3p1-70b-instruct

AMD_API_KEY=
AMD_BASE_URL=
AMD_MODEL=
```

API keys are **never hardcoded** — they are read only from environment variables
on the server, and never exposed to the browser.

## Provider setup

ProofPilot talks to every provider through one OpenAI-compatible transport, so
each provider only differs by base URL, model, and key.

- **NVIDIA** (primary during development): create a key at
  [build.nvidia.com](https://build.nvidia.com) and set `NVIDIA_API_KEY`.
- **Fireworks** (used sparingly for final quality / polished pack generation):
  create a key at [fireworks.ai](https://fireworks.ai) and set
  `FIREWORKS_API_KEY`.
- **AMD** (production claim-analysis path): point `AMD_BASE_URL` at your
  AMD-hosted, OpenAI-compatible endpoint (e.g. an MI300X / ROCm vLLM server on
  AMD Developer Cloud) and set `AMD_API_KEY` and `AMD_MODEL`.

### Switching providers

Set `AI_PROVIDER` and restart:

```env
AI_PROVIDER=nvidia      # development, UI iteration, most testing
AI_PROVIDER=fireworks   # final quality passes and report generation
AI_PROVIDER=amd         # production core claim-analysis workload on AMD compute
```

For multimodal (image) analysis you may optionally set a vision-capable model
per provider via `NVIDIA_VISION_MODEL`, `FIREWORKS_VISION_MODEL`, or
`AMD_VISION_MODEL`; each falls back to the provider's text model when unset.

## Guest-mode localStorage

There is no database. Each audit is stored under the `proofpilot.audits.v1`
localStorage key with a locally-generated ID, and the header shows "Saved on
this device." You can reopen, rename, duplicate, export, and delete audits.
"Sign in to sync across devices" opens a **Coming Soon** modal — no real auth,
protected routes, or cloud sync exist in the MVP.

## PDF / TXT processing

Raw files are never sent to the AI provider. The flow is:

```
Upload PDF/TXT → /api/documents/analyze → validate (≤10 MB, correct type)
  → extract text (pdfjs-dist for PDF) → clean whitespace/headers/page-number noise
  → cap at 50,000 chars (long docs are chunked, analyzed, merged, deduped)
  → send extracted text to the AI provider → return claim audit JSON
  → frontend saves extracted text + audit in localStorage; the raw file is discarded
```

Image-only / scanned PDFs are detected and return a friendly notice: OCR is on
the roadmap. Only extracted text, document name, and analysis are stored.

## Image processing

Images can be a **source** for a new audit (a slide, dashboard, or screenshot)
or **evidence** attached to a claim.

```
Select image → held in memory → /api/analyze-image (multipart/form-data)
  → server converts to base64 → multimodal provider extracts ONLY visible
    text / claims / metrics (never infers) → returns analysis
  → only the analysis + metadata are saved in localStorage; the image is discarded
```

Constraints: PNG/JPG/JPEG/WEBP, ≤8 MB. Full base64 images are **not** stored.
After a refresh the analysis remains, with a note: "Original image not retained."
Uploaded evidence is never auto-labeled "Verified" — statuses are only
*Attached*, *Needs Review*, *User-Reported*, or *Validation Pending*.

## Demo Mode

Demo Mode (`/app/demo`) runs on a pre-generated pitch and claim-analysis JSON so
the presentation stays reliable even if an API fails. It includes a guided
animated analysis progression, the Claim Map, a rewrite example, and an Evidence
Pack preview, clearly labeled "Demo data shown. Live analysis is available in
production mode," plus a **Try Live Audit** button. No user-uploaded images are
used in Demo Mode.

## Product safeguards

ProofPilot never claims to automatically verify truth. It uses the language of
*evidence status*, *support level*, *risk signal*, and *validation
recommendation*, and never fabricates sources, metrics, or research. It does not
browse the web in the MVP unless the user explicitly provides sources.

> ProofPilot helps identify evidence gaps and risky language. Users should
> independently verify legal, medical, financial, and other high-stakes claims.

## Deployment

Deploy to **Vercel** (recommended):

1. Push this repo to GitHub and import it in Vercel.
2. Add the environment variables from `.env.example` in Project Settings.
3. Deploy. The API route handlers run on the Node.js runtime (needed for PDF
   parsing) — no extra configuration required.

Any Node host works with `npm run build && npm start`.

## Future roadmap

- OCR for scanned/image-only PDFs
- Optional accounts and cross-device cloud sync
- Source-grounded verification when users supply references
- Team workspaces and shared Evidence Packs
- Deeper AMD/ROCm deployment recipes and benchmarking

---

# AMD Compute Usage

ProofPilot is designed with an AMD-powered production inference path. The core claim extraction and structured evidence analysis pipeline can run on an AMD GPU-backed OpenAI-compatible endpoint using open-source models and ROCm-compatible infrastructure. NVIDIA APIs are used during rapid development and Fireworks AI is used selectively for final quality testing and report generation. The provider abstraction enables ProofPilot to route its central claim-analysis workload to AMD compute, making AMD inference a core part of the project architecture rather than a cosmetic integration.
#
