FROM node:22-alpine@sha256:d2166de198f26e17e5a442f537754dd616ab069c47cc57b889310a717e0abbf9 AS base

FROM base AS builder
WORKDIR /app

RUN apk update && apk add --no-cache libc6-compat
RUN npm install -g pnpm@10.15.1 turbo@2.0.14 --ignore-scripts
COPY apps ./apps
COPY packages ./packages
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
RUN turbo prune @dotkomonline/invoicification --docker

FROM base AS installer
WORKDIR /app

RUN npm install -g pnpm@10.15.1 turbo@2.0.14 --ignore-scripts
COPY --from=builder /app/out/full .
RUN pnpm install --ignore-scripts
RUN turbo run build --filter @dotkomonline/invoicification

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
