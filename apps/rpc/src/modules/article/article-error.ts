import { ApplicationError } from "../../error.ts"
import { PROBLEM_DETAILS } from "../../http-problem-details.ts"

export class ArticleNotFoundError extends ApplicationError {
  constructor(id: string) {
    super(PROBLEM_DETAILS.NotFound, `Article with ID:${id} not found`)
  }
}

export class ArticleWithSlugAlreadyExistsError extends ApplicationError {
  constructor() {
    super(PROBLEM_DETAILS.BadRequest, "An article with this slug already exists")
  }
}
