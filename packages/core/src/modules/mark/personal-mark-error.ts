import { ApplicationError } from "../../error"

export class PersonalMarkNotFoundError extends ApplicationError {
  constructor(id: string) {
    super("/problem/not-found", 404, `Personal mark with ID:${id} not found`)
  }
}
