import { ApplicationError } from "../../error"

export class JobListingNotFoundError extends ApplicationError {
  constructor(id: string) {
    super("/problem/not-found", 404, `JobListing with ID:${id} not found`)
  }
}

export class InvalidStartDateError extends ApplicationError {
  constructor(reason: string) {
    super("/problem/bad-request", 400, `The start date is invalid: ${reason}`)
  }
}

export class InvalidEndDateError extends ApplicationError {
  constructor(reason: string) {
    super("/problem/bad-request", 400, `The end date is invalid: ${reason}`)
  }
}

export class MissingLocationError extends ApplicationError {
  constructor() {
    super("/problem/bad-request", 400, "The location is invalid")
  }
}

export class InvalidDeadlineError extends ApplicationError {
  constructor(reason: string) {
    super("/problem/bad-request", 400, `The deadline is invalid: ${reason}`)
  }
}
