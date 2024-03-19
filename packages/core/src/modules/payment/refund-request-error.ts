import { ApplicationError } from "../../error"
import { PROBLEM_DETAILS } from "../../http-problem-details"

export class RefundRequestNotFoundError extends ApplicationError {
  constructor(id: string) {
    super(PROBLEM_DETAILS.NotFound, `Refund request for payment with ID:${id} not found`)
  }
}

export class InvalidRefundRequestStatusError extends ApplicationError {
  constructor(expected: string, actual: string) {
    super(PROBLEM_DETAILS.BadRequest, `The refund request status is invalid, wanted ${expected} but was ${actual}`)
  }
}

export class RefundProcessingFailureError extends ApplicationError {
  constructor(reason: string) {
    super(PROBLEM_DETAILS.InternalServerError, `The refund processing failed: ${reason}`)
  }
}
