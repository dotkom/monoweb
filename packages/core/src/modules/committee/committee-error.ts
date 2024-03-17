import { NotFoundError } from "../../error"

export class CommitteeNotFoundError extends NotFoundError {
  constructor(id: string) {
    super(`Committee with ID:${id} not found`)
  }
}
