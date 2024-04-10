import { ApplicationError } from "../../error"
import { PROBLEM_DETAILS } from "../../http-problem-details"

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
