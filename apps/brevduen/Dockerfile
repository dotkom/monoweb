FROM node:22-alpine@sha256:9632533eda8061fc1e9960cfb3f8762781c07a00ee7317f5dc0e13c05e15166f AS base

ARG SENTRY_RELEASE
ARG DOPPLER_ENVIRONMENT

FROM base AS installer
WORKDIR /app

RUN apk update && apk add --no-cache libc6-compat
RUN npm install -g pnpm@10.15.1 --ignore-scripts
COPY apps ./apps
COPY packages ./packages
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --ignore-scripts
RUN pnpm run -r --filter @dotkomonline/emails build

# Install for production
RUN pnpm install --prod --ignore-scripts

FROM base AS runner
WORKDIR /app

RUN apk add --no-cache curl

EXPOSE 3000

ENV NODE_ENV=production

# Embed the Sentry release ID into the container.
ENV SENTRY_RELEASE=${SENTRY_RELEASE}

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 brevduen
USER brevduen

COPY --from=installer --chown=brevduen:nodejs --chmod=755 /app .

CMD node --loader ./apps/brevduen/runtime.mjs --experimental-strip-types ./apps/brevduen/src/index.ts
