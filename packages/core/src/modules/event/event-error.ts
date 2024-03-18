import { ApplicationError } from "../../error"
import { PROBLEM_DETAILS } from "../../problem-details-registry"

export class EventNotFoundError extends ApplicationError {
  constructor(id: string) {
    super(PROBLEM_DETAILS.NotFound, `Event with ID: ${id} not found`)
  }
}

export class EventAlreadyHasWaitlistError extends ApplicationError {
  constructor(id: string) {
    super(PROBLEM_DETAILS.BadRequest, `Event with ID:${id} already has a waitlist`)
  }
}
