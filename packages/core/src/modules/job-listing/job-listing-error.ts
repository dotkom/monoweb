import { ApplicationError } from "../../error"
import { PROBLEM_DETAILS } from "../../http-problem-details"

export class InvalidEndDateError extends ApplicationError {
  constructor(reason: string) {
    super(PROBLEM_DETAILS.UnprocessableContent, `The end date is invalid: ${reason}`)
  }
}

export class InvalidDeadlineError extends ApplicationError {
  constructor(reason: string) {
    super(PROBLEM_DETAILS.UnprocessableContent, `The deadline is invalid: ${reason}`)
  }
}
