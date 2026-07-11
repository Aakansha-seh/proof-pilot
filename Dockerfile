# syntax=docker/dockerfile:1
# ==========================================================================
# ProofPilot — production container
#
# Inference runs on AMD hardware via the Fireworks API (OpenAI-compatible).
# The image bakes only NON-SECRET defaults (provider = amd, endpoint, model).
# The Fireworks API key is supplied at run time, never baked into the image.
#
#   docker build -t proofpilot .
#   docker run --rm -p 3000:3000 --env-file .env.local proofpilot
#
# Minimum .env.local for an AMD/Fireworks run:
#   AMD_API_KEY=<your Fireworks API key>
# (AI_PROVIDER, AMD_BASE_URL and AMD_MODEL already default to AMD/Fireworks below.)
# ==========================================================================

# ---- 1. Install dependencies (cached unless package files change) ----------
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ---- 2. Build the Next.js standalone output --------------------------------
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ---- 3. Minimal runtime image ---------------------------------------------
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# --- AMD-hosted inference via Fireworks (non-secret defaults) ---------------
# ProofPilot's core (claim audit, competitors) uses the "amd" provider slot,
# pointed at the Fireworks OpenAI-compatible endpoint (Fireworks serves on AMD).
ENV AI_PROVIDER=amd
ENV AMD_BASE_URL=https://api.fireworks.ai/inference/v1
ENV AMD_MODEL=accounts/fireworks/models/llama-v3p1-70b-instruct
# The in-app assistant (ProofPilot chatbot) uses the same Fireworks endpoint.
ENV AI_BASE_URL=https://api.fireworks.ai/inference/v1
ENV AI_MODEL=accounts/fireworks/models/llama-v3p1-70b-instruct
# NOTE: the AMD_API_KEY (your Fireworks key) is provided at run time via
# --env-file / -e, so it is NOT stored in the image.

# Run as a non-root user.
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

# Copy the standalone server, static assets and public folder.
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

CMD ["node", "server.js"]
