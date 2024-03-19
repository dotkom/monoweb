import { ApplicationError } from "../../error"
import { PROBLEM_DETAILS } from "../../http-problem-details"

export class ArticleNotFoundError extends ApplicationError {
  constructor(id: string) {
    super(PROBLEM_DETAILS.NotFound, `Article with ID:${id} not found`)
  }
}
