import { ApplicationError } from "../../error"

export class CommitteeNotFoundError extends ApplicationError {
  constructor(id: string) {
    super("/problem/not-found", 404, `Committee with ID:${id} not found`)
  }
}
