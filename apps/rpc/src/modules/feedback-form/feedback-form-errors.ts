import { ApplicationError } from "../../error"
import { PROBLEM_DETAILS } from "../../http-problem-details"

export class FeedbackFormNotFoundError extends ApplicationError {
  constructor() {
    super(PROBLEM_DETAILS.NotFound, "Feedbackform not found")
  }
}
