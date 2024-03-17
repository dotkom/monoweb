import { clientErrorResponse, serverErrorResponse } from "./utils/http-response-constants"

/**
 * Exception type modelled after RFC9457 Problem Details for HTTP APIs
 *
 * @see https://tools.ietf.org/html/rfc7807
 *
 * This implementation does not yet support the `instance` members.
 *
 * All exceptions thrown by the application modules should be of this type in
 * order to be detailed enough for the client to understand the problem and
 * to be able to handle it properly.
 */
export class ApplicationError extends Error {
  constructor(
    public readonly type: string,
    public readonly status: number,
    public readonly title: string,
    public readonly detail?: string
  ) {
    super(detail || title)
  }
}

export class IllegalStateError extends ApplicationError {
  constructor(description: string) {
    const { type, code, title } = serverErrorResponse.InternalServerError
    super(type, code, title, `Illegal state reached: ${description}`)
  }
}

export class InternalServerError extends ApplicationError {
  constructor(detail: string) {
    const { type, code, title } = serverErrorResponse.InternalServerError
    super(type, code, title, detail)
  }
}

export class BadRequestError extends ApplicationError {
  constructor(details?: string) {
    const { type, code, title } = clientErrorResponse.BadRequest
    super(type, code, title, details)
  }
}

export class NotFoundError extends ApplicationError {
  constructor(details: string) {
    const { type, code, title } = clientErrorResponse.NotFound
    super(type, code, title, details)
  }
}

export class ParameterValidationError extends ApplicationError {
  constructor(details?: string) {
    const { type, code } = clientErrorResponse.UnprocessableContent
    const title = "Request parameters validation failed"
    super(type, code, title, details)
  }
}
