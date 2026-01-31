FROM node:22-alpine@sha256:1b2479dd35a99687d6638f5976fd235e26c5b37e8122f786fcd5fe231d63de5b AS base

FROM base AS builder
WORKDIR /app

RUN apk update && apk add --no-cache libc6-compat
RUN npm install -g pnpm@10.15.1 --ignore-scripts
COPY apps ./apps
COPY packages ./packages
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

RUN pnpm install --ignore-scripts
RUN pnpm run -r --filter @dotkomonline/invoicification build

FROM base AS installer
WORKDIR /app

COPY . .

RUN apk update && apk add --no-cache libc6-compat
RUN npm install -g pnpm@10.15.1 --ignore-scripts

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

COPY --from=installer --chown=nextjs:nodejs --chmod=755 /app/node_modules ./node_modules
COPY --from=installer --chown=nextjs:nodejs --chmod=755 /app/apps/invoicification/node_modules ./apps/invoicification/node_modules

COPY --from=builder --chown=nextjs:nodejs --chmod=755 /app/apps/invoicification/.next ./apps/invoicification/.next
COPY --from=builder --chown=nextjs:nodejs --chmod=755 /app/apps/invoicification/public ./apps/invoicification/public
COPY --from=builder --chown=nextjs:nodejs --chmod=755 /app/apps/invoicification/package.json ./apps/invoicification/package.json

WORKDIR /app/apps/invoicification

CMD ["npm", "run", "start"]
