import { ApplicationError, IllegalStateError } from "../../error"
import { PROBLEM_DETAILS } from "../../http-problem-details"

export class InvalidJobType extends IllegalStateError {
  constructor(type: string) {
    super(`Invalid job type: ${type}. This is a severe bug in the application.`)
  }
}

export class JobNotFound extends ApplicationError {
  constructor(id: string) {
    super(PROBLEM_DETAILS.NotFound, `Job with id ${id} not found`)
  }
}

export class JobPayloadValidationError extends ApplicationError {
  constructor(detail: string) {
    super(PROBLEM_DETAILS.UnprocessableContent, detail)
  }
}

export class PayloadHandlerNotFoundError extends ApplicationError {
  constructor(name: string) {
    super(PROBLEM_DETAILS.NotFound, `Payload handler for job ${name} not found`)
  }
}

export class PayloadNotFoundError extends ApplicationError {
  constructor(name: string) {
    super(PROBLEM_DETAILS.NotFound, `Payload for job ${name} not found, but is required`)
  }
}

export class JobExecutorAlreadyInitializedError extends ApplicationError {
  constructor() {
    super(PROBLEM_DETAILS.IllegalState, "Job executor already initialized")
  }
}

export class JobExecutorNotInitializedError extends ApplicationError {
  constructor() {
    super(PROBLEM_DETAILS.IllegalState, "Job executor not initialized")
  }
}
