import { NotFoundError, ParameterValidationError } from "../../error"

export class JobListingNotFoundError extends NotFoundError {
  constructor(id: string) {
    super(`Job Listing with ID:${id} not found`)
  }
}

export class InvalidStartDateError extends ParameterValidationError {
  constructor(reason: string) {
    super(`The start date is invalid: ${reason}`)
  }
}

export class InvalidEndDateError extends ParameterValidationError {
  constructor(reason: string) {
    super(`The end date is invalid: ${reason}`)
  }
}

export class MissingLocationError extends ParameterValidationError {
  constructor() {
    super("A job listing must have at least one location")
  }
}

export class InvalidDeadlineError extends ParameterValidationError {
  constructor(reason: string) {
    super(`The deadline is invalid: ${reason}`)
  }
}
