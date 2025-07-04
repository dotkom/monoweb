import pino from "pino"

// biome-ignore lint/suspicious/noExplicitAny: this should be any for inference reasons
export type LoggerIdentifier = string | (new (...args: any[]) => any)

export function getBrowserLogger(identifier: LoggerIdentifier) {
  return createLogger(identifier)
}

export function createLogger(name: LoggerIdentifier) {
  const identifier = name instanceof Function ? name.name : name
  return pino({
    name: identifier,
    transport: {
      target: "pino-pretty",
    },
  })
}
