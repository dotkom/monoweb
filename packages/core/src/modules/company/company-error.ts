import { ApplicationError } from "../../error"
import { PROBLEM_DETAILS } from "../../problem-details-registry"

export class CompanyNotFoundError extends ApplicationError {
  constructor(id: string) {
    super(PROBLEM_DETAILS.NotFound, `Company with ID:${id} not found`)
  }
}
