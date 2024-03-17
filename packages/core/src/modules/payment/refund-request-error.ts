import { BadRequestError, InternalServerError, NotFoundError } from "../../error"

export class RefundRequestNotFoundError extends NotFoundError {
  constructor(id: string) {
    super(`Refund request for payment with ID:${id} not found`)
  }
}

export class InvalidRefundRequestStatusError extends BadRequestError {
  constructor(expected: string, actual: string) {
    super(`The refund request status is invalid, wanted ${expected} but was ${actual}`)
  }
}

export class RefundProcessingFailureError extends InternalServerError {
  constructor(reason: string) {
    super(`The refund processing failed: ${reason}`)
  }
}
