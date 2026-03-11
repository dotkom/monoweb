import { trace } from "@opentelemetry/api"

/**
 * Base class for all application-specific errors.
 *
 * This class captures the current trace ID from OpenTelemetry, if available.
 */
export class ApplicationError extends Error {
  public readonly traceId: string | undefined

  constructor(message: string) {
    super(message)
    this.traceId = trace.getActiveSpan()?.spanContext().traceId
  }
}

export class IllegalStateError extends ApplicationError {}
export class UnimplementedError extends ApplicationError {}
export class InternalServerError extends ApplicationError {}
export class InvalidArgumentError extends ApplicationError {}
export class NotFoundError extends ApplicationError {}
export class AlreadyExistsError extends ApplicationError {}
export class FailedPreconditionError extends ApplicationError {}
export class ResourceExhaustedError extends ApplicationError {}
export class ForbiddenError extends ApplicationError {}
/**
 * This should probably have been called UnauthenticatedError, but this follows tRPC Error code naming scheme.
 *
 * See https://trpc.io/docs/server/error-handling#error-codes
 */
export class UnauthorizedError extends ApplicationError {}

export function assert(condition: unknown, error: Error): asserts condition {
  if (!condition) {
    throw error
  }
}
