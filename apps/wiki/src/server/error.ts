import { ArticleId } from "./types"

export class ArticleNotFoundError extends Error {
  constructor(id: ArticleId) {
    super(`Article with ID:${id} not found`)
  }
}
