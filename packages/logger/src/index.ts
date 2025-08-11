import { OpenTelemetryTransportV3 } from "@opentelemetry/winston-transport"
import * as winston from "winston"

function padWithColor(str: string, desiredLength: number) {
  // biome-ignore lint/suspicious/noControlCharactersInRegex: <explanation>
  const ansiEscapeCodes = /\x1b\[[0-9;]*m/g // Regex to match ANSI escape codes
  const visibleLength = str.replace(ansiEscapeCodes, "").length // Length of string without ANSI codes
  const paddingLength = desiredLength - visibleLength // Calculate how much padding is needed
  return str + " ".repeat(paddingLength) // Pad the string with spaces
}
export type Logger = ReturnType<typeof getLogger>

// biome-ignore lint/suspicious/noExplicitAny: safe for any constructor name here
export function getLogger(name: string | (new (...args: any[]) => any)): winston.Logger {
  const identifier = name instanceof Function ? name.name : name
  const format = winston.format.combine(
    winston.format.splat(),
    winston.format.colorize(),
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.printf((msg) => {
      const levelPadded = padWithColor(msg.level, 7)
      const dim = "\x1b[2m"
      const reset = "\x1b[0m"
      return `${levelPadded}[${msg.timestamp}](trace=${msg.trace_id ?? "none"},span=${msg.span_id ?? "none"}) ${msg.message} ${dim}(${identifier})${reset}`
    })
  )
  return winston.createLogger({
    transports: [new winston.transports.Console({ format }), new OpenTelemetryTransportV3({ format })],
  })
}
