import { ApplicationError } from "../../error"
import { PROBLEM_DETAILS } from "../../http-problem-details"

export class StudentGroupsNotFoundError extends ApplicationError {
  constructor(message: string) {
    super(PROBLEM_DETAILS.NotFound, `Failed to fetch student's feide groups: ${message}`)
  }
}
