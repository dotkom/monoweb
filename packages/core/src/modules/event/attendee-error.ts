import { ApplicationError } from "../../error"
import { PROBLEM_DETAILS } from "../../problem-details-registry"

export class AttendeeNotFoundError extends ApplicationError {
  constructor(detail: string) {
    super(PROBLEM_DETAILS.NotFound, detail)
  }
}
