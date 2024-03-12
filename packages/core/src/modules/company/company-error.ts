import { ApplicationError } from "../../error"

export class CompanyNotFoundError extends ApplicationError {
  constructor(id: string) {
    super("/problem/not-found", 404, `Company with ID:${id} not found`)
  }
}
