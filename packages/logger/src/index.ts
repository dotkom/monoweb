import winston, { format } from "winston";
import { env } from "@dotkomonline/env";
export type { Logger } from "winston";

export const getLogger = (path: string) =>
    winston.createLogger({
        level: "info",
        silent: env.NODE_ENV === "test",
        format: format.json(),
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
