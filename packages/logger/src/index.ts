import { env } from "@dotkomonline/env";
import winston, { format } from "winston";
export type { Logger } from "winston";

export const getLogger = (path: string) =>
  winston.createLogger({
    format: format.json(),
    level: "info",
    silent: env.NODE_ENV === "test",
    transports: [
      new winston.transports.Console({
        format: format.combine(
          format.colorize(),
          format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
          format.printf((msg) => `${msg.level} [${msg.timestamp}] ${msg.message} (${path})`)
        ),
      }),
    ],
  });
