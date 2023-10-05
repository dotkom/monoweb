import { applyCorsMiddleware } from "@/middlewares/cors";
import { appRouter, createContext } from "@dotkomonline/gateway-trpc";
import { createNextApiHandler } from "@trpc/server/adapters/next";

// export API handler
export default applyCorsMiddleware(
    createNextApiHandler({
        createContext,
        router: appRouter,
    })
);
