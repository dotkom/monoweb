import { ApplicationError } from "../../error.ts"
import { PROBLEM_DETAILS } from "../../http-problem-details.ts"

export class PersonalMarkNotFoundError extends ApplicationError {
  constructor(id: string) {
    super(PROBLEM_DETAILS.NotFound, `Personal mark with ID:${id} not found`)
  }
}
