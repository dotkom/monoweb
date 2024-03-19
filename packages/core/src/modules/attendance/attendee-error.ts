import { ApplicationError } from "../../error"
import { PROBLEM_DETAILS } from "../../problem-details-registry"

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
