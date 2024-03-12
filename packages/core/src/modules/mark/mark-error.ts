import { NotFoundError } from "../../error"

export class MarkNotFoundError extends NotFoundError {
  constructor(id: string) {
    super(`Mark with ID:${id} not found`)
  }
}
