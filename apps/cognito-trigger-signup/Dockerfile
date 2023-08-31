FROM public.ecr.aws/lambda/nodejs:18 as builder
WORKDIR /usr/app
COPY apps ./apps
COPY packages ./packages
COPY package.json tsconfig.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
RUN npm i -g pnpm@8
RUN pnpm install
RUN pnpm build:cognito-trigger-signup

FROM public.ecr.aws/lambda/nodejs:18
WORKDIR ${LAMBDA_TASK_ROOT}
COPY --from=builder /usr/app/apps/cognito-trigger-signup/dist/* ./
CMD ["lambda.handler"]
