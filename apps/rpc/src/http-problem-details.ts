import type { ProblemDetail } from "./error"

const RFC_REGISTRY_BASE = "https://datatracker.ietf.org/doc/html/rfc9110#name"

type ProblemDetails = {
  BadRequest: ProblemDetail
  NotFound: ProblemDetail
  UnprocessableContent: ProblemDetail
  InternalServerError: ProblemDetail
  IllegalState: ProblemDetail
}

/**
 * All the supported problem details types for the application, in accordance with RFC 9457.
 * If problem type is a locator, the client can dereference it to get more information about the problem.
 *
 * When adding new problem details types,
 * @see https://datatracker.ietf.org/doc/html/rfc9457#name-defining-new-problem-types
 *
 */
export const PROBLEM_DETAILS: ProblemDetails = {
  BadRequest: {
    status: 400,
    title: "Bad Request",
    type: `${RFC_REGISTRY_BASE}-400-bad-request`,
  },
  NotFound: {
    status: 404,
    title: "Not Found",
    type: `${RFC_REGISTRY_BASE}-404-not-found`,
  },
  UnprocessableContent: {
    status: 422,
    title: "Unprocessable Content",
    type: `${RFC_REGISTRY_BASE}-422-unprocessable-content`,
  },
  InternalServerError: {
    status: 500,
    title: "Internal Server Error",
    type: `${RFC_REGISTRY_BASE}-500-internal-server-error`,
  },
  IllegalState: {
    status: 500,
    title: "Invalid state reached",
    type: "/problem/illegal-state", // TODO: create page for this that describes how to resolve the problem and change this to a URL to that page. (https://datatracker.ietf.org/doc/html/rfc9457#section-4-10)
  },
}
