# ProofPilot

Paste in a startup pitch and ProofPilot pulls out every claim you're making, scores how believable it looks, points at the proof you're missing, and rewrites the shaky lines so they'll survive an investor asking "says who?".

Built for the AMD Developer Hackathon: ACT II (Unicorn track). Inference runs on AMD hardware through the Fireworks API.

## What it does

- **Claim audit** — reads your pitch, extracts the actual claims, tags each one (factual, performance, market, guarantee, and so on), rates its risk and whether there's evidence behind it, and gives the whole pitch a credibility score out of 100.
- **Claim Map** — drops every claim into one of four buckets: proven, needs evidence, risky language, future validation. You can see at a glance what's solid and what's hand-waving.
- **Rewrite** — proposes a defensible version of each weak claim, then re-audits the rewritten pitch so you can watch the score move.
- **Competitor intel** — finds who you're up against, what they've shipped recently, and the gaps worth going after. Pulls live sources through Tavily when a key is set; degrades gracefully to "no recent activity found" when it isn't.
- **Evidence Pack** — exports the audit to PDF for your data room.
- **Assistant** — a chat widget that only knows the audit you're currently looking at. Ask "what's my weakest claim?" and it answers from your data, not the open internet.

Audits are saved in the browser (localStorage), not on a server. No login, no database — clearing your site data wipes them. That's on purpose: you shouldn't have to upload an unreleased pitch to someone's SaaS to get notes on it.

## Quick start

```bash
npm install
cp .env.example .env.local      # add a key, see below
npm run dev
```

Then open http://localhost:3000.

You need at least one inference key for the AI features to do anything. Without one, the UI loads but every analysis call returns an error.

## Environment

Copy `.env.example` to `.env.local` and fill in what you need. The important ones:

| Variable | What it's for |
| --- | --- |
| `AI_PROVIDER` | Which backend the app talks to: `nvidia`, `fireworks`, or `amd`. |
| `AMD_API_KEY` / `AMD_BASE_URL` / `AMD_MODEL` | The "AMD" provider slot. For this hackathon it points at Fireworks (AMD-hosted, OpenAI-compatible). |
| `FIREWORKS_API_KEY` / `FIREWORKS_MODEL` | Use these if you'd rather set `AI_PROVIDER=fireworks` directly. |
| `NVIDIA_API_KEY` / `NVIDIA_MODEL` | Handy for local dev — get a free key at build.nvidia.com. |
| `SEARCH_PROVIDER` | `tavily` for live competitor sources, or `none`. |
| `TAVILY_API_KEY` | Only needed when `SEARCH_PROVIDER=tavily`. |

The in-app assistant reuses whichever of these keys is present (it checks `AI_* → FIREWORKS_* → AMD_* → NVIDIA_*`), so you don't have to configure it separately.

## Running on AMD

Fireworks serves its models on AMD hardware, so the app talks to it over the standard OpenAI-compatible API. Point the AMD slot at Fireworks and set the provider:

```bash
AI_PROVIDER=amd
AMD_BASE_URL=https://api.fireworks.ai/inference/v1
AMD_MODEL=accounts/fireworks/models/llama-v3p1-70b-instruct
AMD_API_KEY=fw-your-key-here
```

Swap `AMD_MODEL` for a Gemma model on Fireworks if you want the assistant and audits running on Gemma.

## Docker

The image is built from a standalone Next.js bundle and runs as a non-root user. Secrets are passed in at run time, never baked into the image.

```bash
docker build -t proofpilot .
docker run --rm -p 3000:3000 --env-file .env.local proofpilot
```

`AI_PROVIDER=amd` and the Fireworks endpoint/model are already set as defaults inside the image, so the only thing your `.env.local` strictly needs is `AMD_API_KEY`.

## How it's put together

It's a Next.js App Router project. Pages and API routes live under `src/app`, UI components under `src/components`.

All model calls go through a thin OpenAI-compatible provider layer in `src/lib/ai`, which is why `nvidia`, `fireworks`, and `amd` are interchangeable — switching backends is an env change, not a code change. Model output is coerced against zod schemas (`src/lib/schemas.ts`) and repaired if the model returns slightly malformed JSON, so a wobbly response doesn't blow up the UI.

The assistant is its own self-contained module under `src/chatbot` — prompt, domain guard, and client — sitting behind `/api/chat`. Each request carries a serialized snapshot of the current audit, and the assistant is instructed to answer only from that. Switch audits and the conversation resets.

## Project layout

```
src/
  app/            Pages + API routes (App Router)
  components/     UI, including components/chat (the assistant widget)
  chatbot/        Self-contained assistant: prompt, domain guard, client
  lib/ai/         OpenAI-compatible provider layer (nvidia | fireworks | amd)
  lib/            Schemas, local store (zustand), PDF + competitor helpers
```

## Stack

Next.js 15 (App Router, React 19) · TypeScript · Tailwind · zustand for local persistence · zod for schema validation · framer-motion · jsPDF and pdf.js for exports.

## Known rough edges

- PDF upload on the "analyze startup" page is accepted and stored, but text extraction from the deck isn't wired up yet.
- Audit quality is only as good as the model behind whichever provider you point at. An 8B model is fine for a demo; a 70B (or Gemma) gives noticeably better claim extraction.
- "Sign in to sync" is a placeholder — there's no cloud sync yet, everything is device-local.

## License

MIT.
