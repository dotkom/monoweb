import winston, { format } from "winston"

// biome-ignore lint/suspicious/noExplicitAny: this should be any for inference reasons
export type LoggerIdentifier = string | (new (...args: any[]) => any)

interface Message {
  level: string
  message: string
  timestamp: string
  identifier: string
}

function padWithColor(str: string, desiredLength: number) {
  // biome-ignore lint/suspicious/noControlCharactersInRegex: <explanation>
  const ansiEscapeCodes = /\x1b\[[0-9;]*m/g // Regex to match ANSI escape codes
  const visibleLength = str.replace(ansiEscapeCodes, "").length // Length of string without ANSI codes
  const paddingLength = desiredLength - visibleLength // Calculate how much padding is needed
  return str + " ".repeat(paddingLength) // Pad the string with spaces
}

const formatMessage = ({ level, message, timestamp, identifier }: Message) => {
  const levelPadded = padWithColor(level, 7)
  const dim = "\x1b[2m"
  const reset = "\x1b[0m"
  return `${levelPadded}[${timestamp}] ${message} ${dim}(${identifier})${reset}`
}

export function getBrowserLogger(identifier: LoggerIdentifier) {
  return getLoggerWithTransports(identifier)
}

export function getLoggerWithTransports(name: LoggerIdentifier, transports: winston.transport[] = []): winston.Logger {
  const identifier = name instanceof Function ? name.name : name
  return winston.createLogger({
    level: "info",
    transports: [
      new winston.transports.Console({
        format: format.combine(
          format.splat(),
          format.colorize(),
          format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
          format.printf((msg) =>
            formatMessage({
              level: msg.level,
              message: msg.message as string,
              timestamp: msg.timestamp as string,
              identifier,
            })
          )
        ),
      }),
      ...transports,
    ],
  })
}
