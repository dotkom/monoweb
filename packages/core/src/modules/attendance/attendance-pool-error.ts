import { ApplicationError } from "../../error"
import { PROBLEM_DETAILS } from "../../http-problem-details"

export class AttendancePoolValidationError extends ApplicationError {
  constructor(detail: string) {
    super(PROBLEM_DETAILS.UnprocessableContent, detail)
  }
}

export class CantDeletePoolError extends ApplicationError {
  constructor(detail: string) {
    super(PROBLEM_DETAILS.InternalServerError, detail)
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
