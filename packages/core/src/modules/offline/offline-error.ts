import { NotFoundError } from "../../error"

export class OfflineNotFoundError extends NotFoundError {
  constructor(id: string) {
    super(`Offline with ID:${id} not found`)
  }
}
