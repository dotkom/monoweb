import { ApplicationError } from "../../error"
import { PROBLEM_DETAILS } from "../../http-problem-details"

export class UserNotFoundError extends ApplicationError {
  constructor(id: string) {
    super(PROBLEM_DETAILS.NotFound, `User with ID:${id} not found`)
  }
}

export class UserNoFeideTokenError extends ApplicationError {
  constructor(id: string) {
    super(PROBLEM_DETAILS.BadRequest, `User with ID:${id} does not have a stored FEIDE token`)
  }
}
