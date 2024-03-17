import { NotFoundError } from "../../error"

export class PersonalMarkNotFoundError extends NotFoundError {
  constructor(id: string) {
    super(`Personal mark with ID:${id} not found`)
  }
}
