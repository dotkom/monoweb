import { ApplicationError } from "../../error"
import { PROBLEM_DETAILS } from "../../http-problem-details"

export class CommitteeNotFoundError extends ApplicationError {
  constructor(id: string) {
    super(PROBLEM_DETAILS.NotFound, `Committee with ID:${id} not found`)
  }
}
