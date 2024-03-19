import { PROBLEM_DETAILS } from "./http-problem-details"

/**
 * Represents a problem details type.
 *
 * This implementation does not yet support:
 * - instance member
 * - extension members
 *
 * @see https://datatracker.ietf.org/doc/html/rfc9457#name-the-problem-details-json-ob
 */
export type ProblemDetails = Pick<ApplicationError, "type" | "status" | "title">

/**
 * Exception type modelled after RFC9457 Problem Details for HTTP APIs
 *
 * @see https://tools.ietf.org/html/rfc7807
 *
 * This implementation does not yet support:
 * - instance member
 * - extension members
 *
 * All exceptions thrown by the application modules should be of this type in
 * order to be detailed enough for the client to understand the problem and
 * to be able to handle it properly.
 */
export class ApplicationError extends Error {
  public readonly type: string
  public readonly status: number
  public readonly title: string
  public readonly detail?: string

  constructor(problemType: ProblemDetails, detail?: string) {
    const { type, status, title } = problemType

    super(detail ?? title)

    this.type = type
    this.status = status
    this.title = title
    this.detail = detail
  }
}

export class IllegalStateError extends ApplicationError {
  constructor(detail: string) {
    super(PROBLEM_DETAILS.IllegalState, detail)
  }
}
