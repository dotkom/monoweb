import { ApplicationError } from "../../error"

export class MarkNotFoundError extends ApplicationError {
  constructor(id: string) {
    super("/problem/not-found", 404, `Mark with ID:${id} not found`)
  }
}
