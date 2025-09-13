import { ApplicationError } from "../../error.ts"
import { PROBLEM_DETAILS } from "../../http-problem-details.ts"

export class CompanyNotFoundError extends ApplicationError {
  constructor(id: string) {
    super(PROBLEM_DETAILS.NotFound, `Company with ID:${id} not found`)
  }
}
