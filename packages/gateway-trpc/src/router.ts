import { committeeRouter } from "./modules/committee/committee-router";
import { companyRouter } from "./modules/company/company-router";
import { eventRouter } from "./modules/event/event-router";
import { markRouter } from "./modules/mark/mark-router";
import { paymentRouter } from "./modules/payment/payment-router";
import { userRouter } from "./modules/user/user-router";
import { t } from "./trpc";

export const appRouter = t.router({
  committee: committeeRouter,
  company: companyRouter,
  event: eventRouter,
  mark: markRouter,
  payment: paymentRouter,
  user: userRouter,
});

export type AppRouter = typeof appRouter;
