import { ApplicationError } from "../../error"
import { PROBLEM_DETAILS } from "../../http-problem-details"

export class AttendanceNotFound extends ApplicationError {
  constructor(id: string) {
    super(PROBLEM_DETAILS.NotFound, `Attendance with id ${id} not found`)
  }
}

export class AttendanceValidationError extends ApplicationError {
  constructor(detail: string) {
    super(PROBLEM_DETAILS.UnprocessableContent, detail)
  }
}

export class AttendanceDeletionError extends ApplicationError {
  constructor(detail: string) {
    super(PROBLEM_DETAILS.UnprocessableContent, detail)
  }
}

export class InvalidParametersError extends ApplicationError {
  constructor(detail: string) {
    super(PROBLEM_DETAILS.UnprocessableContent, detail)
  }
}

export class ExtrasUpdateAfterRegistrationStartError extends ApplicationError {
  constructor() {
    super(PROBLEM_DETAILS.BadRequest, "If you need to modify extras after registration has started contact dotkom")
  }
}
