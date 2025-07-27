import { ApplicationError } from "../../error"
import { PROBLEM_DETAILS } from "../../http-problem-details"

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
