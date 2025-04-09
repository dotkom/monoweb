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

export class SelectionResponseUpdateAfterRegistrationStartError extends ApplicationError {
  constructor() {
    super(PROBLEM_DETAILS.BadRequest, "If you need to modify selections after registration has started contact dotkom")
  }
}

export class AttendanceNotOpenError extends ApplicationError {
  constructor() {
    super(PROBLEM_DETAILS.BadRequest, "This attendance is not open")
  }
}

export class AttendanceDeregisterClosedError extends ApplicationError {
  constructor() {
    super(PROBLEM_DETAILS.BadRequest, "The deregister deadline has passed")
  }
}
