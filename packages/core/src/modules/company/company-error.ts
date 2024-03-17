import { NotFoundError } from "../../error"

export class CompanyNotFoundError extends NotFoundError {
  constructor(id: string) {
    super(`Company with ID:${id} not found`)
  }
}
