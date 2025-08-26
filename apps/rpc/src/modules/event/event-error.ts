import { ApplicationError } from "../../error"
import { PROBLEM_DETAILS } from "../../http-problem-details"

export class EventNotFoundError extends ApplicationError {
  constructor(message: string) {
    super(PROBLEM_DETAILS.NotFound, message)
  }
}

export class EventAlreadyHasWaitlistError extends ApplicationError {
  constructor(id: string) {
    super(PROBLEM_DETAILS.BadRequest, `Event with ID:${id} already has a waitlist`)
  }
}

export class EventRelationshipError extends ApplicationError {
  constructor(message: string) {
    super(PROBLEM_DETAILS.BadRequest, message)
  }
}
