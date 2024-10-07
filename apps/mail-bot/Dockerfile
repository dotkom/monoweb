# FROM public.ecr.aws/lambda/nodejs:20 AS builder
FROM public.ecr.aws/lambda/nodejs:latest-arm64 AS builder

WORKDIR /usr/app
COPY apps ./apps
COPY packages ./packages
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./

RUN npm i -g pnpm@9.0.4
RUN pnpm install --frozen-lockfile
RUN pnpm build:email-slack-app

FROM public.ecr.aws/lambda/nodejs:latest-arm64 AS runner
# FROM public.ecr.aws/lambda/nodejs:20 AS runner

WORKDIR ${LAMBDA_TASK_ROOT}

COPY --from=builder /usr/app/apps/email-slack-app/dist/* ./

CMD ["lambda.handler"]
