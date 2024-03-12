import { ApplicationError } from "../../error"

export class AttendeeNotFoundError extends ApplicationError {
  constructor(id: string) {
    super("/problem/not-found", 404, `Attendee with ID:${id} not found`)
  }
}
