import { ApplicationError } from "../../error"
import { PROBLEM_DETAILS } from "../../problem-details-registry"

export class ArticleNotFoundError extends ApplicationError {
  constructor(id: string) {
    super(PROBLEM_DETAILS.NotFound, `Article with ID:${id} not found`)
  }
}
