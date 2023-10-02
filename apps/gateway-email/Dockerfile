FROM public.ecr.aws/lambda/nodejs:18 as builder

WORKDIR /usr/app
COPY apps ./apps
COPY packages ./packages
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.json turbo.json ./

RUN npm i -g pnpm@8
RUN pnpm install --frozen-lockfile
RUN pnpm build:gateway-email

FROM public.ecr.aws/lambda/nodejs:18

WORKDIR ${LAMBDA_TASK_ROOT}

COPY --from=builder /usr/app/apps/gateway-email/dist/* ./

CMD ["lambda.handler"]
