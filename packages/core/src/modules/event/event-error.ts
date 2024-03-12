import { ApplicationError } from "../../error"

export class EventNotFoundError extends ApplicationError {
  constructor(id: string) {
    super("/problem/not-found", 404, `Event with ID:${id} not found`)
  }
}

export class EventAlreadyHasWaitlistError extends ApplicationError {
  constructor(id: string) {
    super("/problem/bad-request", 400, `Event with ID:${id} already has a waitlist`)
  }
}
