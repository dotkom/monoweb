import { ApplicationError } from "../../error"

export class ArticleNotFoundError extends ApplicationError {
  constructor(id: string) {
    super("/problem/not-found", 404, `Article with ID:${id} not found`)
  }
}
