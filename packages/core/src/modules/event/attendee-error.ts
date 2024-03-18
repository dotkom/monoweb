import { ApplicationError } from "../../error"
import { PROBLEM_DETAILS } from "../../problem-details-registry"

export class AttendeeNotFoundError extends ApplicationError {
  constructor(id: string) {
    super(PROBLEM_DETAILS.NotFound, `Attendee with ID:${id} not found`)
  }
}
