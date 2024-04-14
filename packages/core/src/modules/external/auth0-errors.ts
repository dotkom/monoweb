import { ApplicationError } from "../../error"
import { PROBLEM_DETAILS } from "../../http-problem-details"

export class Auth0UserNotFoundError extends ApplicationError {
  constructor(id: string) {
    super(PROBLEM_DETAILS.NotFound, `User with id ${id} not found in Auth0`)
  }
}

export class UpdateUserClientError extends ApplicationError {
  constructor(details: string) {
    super(PROBLEM_DETAILS.BadRequest, details)
  }
}

export class UpdateUserServerError extends ApplicationError {
  constructor(details: string) {
    super(PROBLEM_DETAILS.InternalServerError, details)
  }
}

export class GetUserServerError extends ApplicationError {
  constructor(details: string) {
    super(PROBLEM_DETAILS.InternalServerError, details)
  }
}
