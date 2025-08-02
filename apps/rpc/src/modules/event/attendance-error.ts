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

export class AttendancePoolNotFoundError extends ApplicationError {
  constructor(id: string) {
    super(PROBLEM_DETAILS.NotFound, `Attendance pool with id ${id} not found`)
  }
}

export class WrongAttendancePoolError extends ApplicationError {
  constructor(expectedPoolId: string, actualPoolId: string) {
    super(PROBLEM_DETAILS.NotFound, `Expected attendance pool with id ${expectedPoolId}, but found ${actualPoolId}`)
  }
}
