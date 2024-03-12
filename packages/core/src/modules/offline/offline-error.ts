import { ApplicationError } from "../../error"

export class OfflineNotFoundError extends ApplicationError {
  constructor(id: string) {
    super("/problem/not-found", 404, `Offline with ID:${id} not found`)
  }
}
