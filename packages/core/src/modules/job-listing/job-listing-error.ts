import { ApplicationError } from "../../error"
import { PROBLEM_DETAILS } from "../../problem-details-registry"

export class JobListingNotFoundError extends ApplicationError {
  constructor(id: string) {
    super(PROBLEM_DETAILS.NotFound, `Job Listing with ID:${id} not found`)
  }
}

export class InvalidStartDateError extends ApplicationError {
  constructor(reason: string) {
    super(PROBLEM_DETAILS.UnprocessableContent, `The start date is invalid: ${reason}`)
  }
}

export class InvalidEndDateError extends ApplicationError {
  constructor(reason: string) {
    super(PROBLEM_DETAILS.UnprocessableContent, `The end date is invalid: ${reason}`)
  }
}

export class MissingLocationError extends ApplicationError {
  constructor() {
    super(PROBLEM_DETAILS.UnprocessableContent, "The location is missing")
  }
}

export class InvalidDeadlineError extends ApplicationError {
  constructor(reason: string) {
    super(PROBLEM_DETAILS.UnprocessableContent, `The deadline is invalid: ${reason}`)
  }
}
