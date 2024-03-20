import { ApplicationError } from "../../error"
import { PROBLEM_DETAILS } from "../../http-problem-details"

export class AttendeeRegistrationError extends ApplicationError {
  constructor(detail: string) {
    super(PROBLEM_DETAILS.BadRequest, detail)
  }
}

export class AttendeeDeregistrationError extends ApplicationError {
  constructor(detail: string) {
    super(PROBLEM_DETAILS.BadRequest, detail)
  }
}

export class UpdateAttendeeError extends ApplicationError {
  constructor(detail: string) {
    super(PROBLEM_DETAILS.BadRequest, detail)
  }
}
