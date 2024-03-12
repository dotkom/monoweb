import { ApplicationError } from "../../error"

export class RefundRequestNotFoundError extends ApplicationError {
  constructor(id: string) {
    super("/problem/not-found", 404, `Refund request for payment with ID:${id} not found`)
  }
}

export class InvalidRefundRequestStatusError extends ApplicationError {
  constructor(expected: string, actual: string) {
    super("/problem/bad-request", 400, `The refund request status is invalid, wanted ${expected} but was ${actual}`)
  }
}

export class RefundProcessingFailureError extends ApplicationError {
  constructor(reason: string) {
    super("/problem/internal-server-error", 500, `The refund processing failed: ${reason}`)
  }
}
