import { ApplicationError } from "../../error"
import { PROBLEM_DETAILS } from "../../http-problem-details"

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

export class JobHandlerNotFound extends ApplicationError {
  constructor(handler: string) {
    super(PROBLEM_DETAILS.NotFound, `Job handler with name '${handler}' not found`)
  }
}

export class JobHandlerDoesNotExistOnGenericJob extends ApplicationError {
  constructor() {
    super(PROBLEM_DETAILS.NotFound, "Job handler does not exist on generic job")
  }
}

export class ScheduledTaskNotFound extends ApplicationError {
  constructor(id: string) {
    super(PROBLEM_DETAILS.NotFound, `Scheduled task with id ${id} not found`)
  }
}

export class JobNotEnabledError extends ApplicationError {
  constructor(id: string) {
    super(PROBLEM_DETAILS.IllegalState, `Job with id ${id} is not enabled and cannot be scheduled`)
  }
}
