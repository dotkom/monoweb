import { ApplicationError } from "../../error.ts"
import { PROBLEM_DETAILS } from "../../http-problem-details.ts"

export class FeedbackFormNotFoundError extends ApplicationError {
  constructor() {
    super(PROBLEM_DETAILS.NotFound, "Feedbackform not found")
  }
}
