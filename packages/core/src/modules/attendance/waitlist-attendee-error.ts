import { ApplicationError } from "../../error"
import { PROBLEM_DETAILS } from "../../http-problem-details"

export class AttendancePoolValidationError extends ApplicationError {
  constructor(detail: string) {
    super(PROBLEM_DETAILS.UnprocessableContent, detail)
  }
}

export class CantDeletePoolError extends ApplicationError {
  constructor(detail: string) {
    super(PROBLEM_DETAILS.UnprocessableContent, detail)
  }
}

export class AttendancePoolNotFoundError extends ApplicationError {
  constructor(id: string) {
    super(PROBLEM_DETAILS.UnprocessableContent, `Attendance pool with id ${id} not found`)
  }
}
