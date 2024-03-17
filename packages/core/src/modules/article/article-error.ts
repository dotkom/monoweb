import { NotFoundError } from "../../error"

export class ArticleNotFoundError extends NotFoundError {
  constructor(id: string) {
    super(`Article with ID:${id} not found`)
  }
}
