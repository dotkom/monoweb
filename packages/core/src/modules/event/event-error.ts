import { BadRequestError, NotFoundError } from "../../error"

export class EventNotFoundError extends NotFoundError {
  constructor(id: string) {
    super(`Event with ID:${id} not found`)
  }
}

export class EventAlreadyHasWaitlistError extends BadRequestError {
  constructor(id: string) {
    super(`Event with ID:${id} already has a waitlist`)
  }
}
