FROM node:22-alpine@sha256:a9cd9bac76cf2396abf14ff0d1c3671a8175fe577ce350e62ab0fc1678050176 AS base

FROM base AS installer
WORKDIR /app

RUN apk update && apk add --no-cache libc6-compat
RUN npm install -g pnpm@10.15.1 --ignore-scripts
COPY apps ./apps
COPY packages ./packages
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

RUN pnpm install --ignore-scripts
RUN pnpm run -r --filter @dotkomonline/invoicification build

RUN pnpm install --prod --ignore-scripts --config.confirmModulesPurge=false

FROM base AS runner
WORKDIR /app

RUN apk add --no-cache curl

EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

COPY --from=installer --chown=nextjs:nodejs --chmod=755 /app/apps/invoicification/.next/standalone ./
COPY --from=installer --chown=nextjs:nodejs --chmod=755 /app/apps/invoicification/.next/static ./apps/invoicification/.next/static
COPY --from=installer --chown=nextjs:nodejs --chmod=755 /app/apps/invoicification/public ./apps/invoicification/public

CMD node apps/invoicification/server.js
