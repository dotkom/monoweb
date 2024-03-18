import { ApplicationError } from "../../error"
import { PROBLEM_DETAILS } from "../../problem-details-registry"

export class StripeAccountNotFoundError extends ApplicationError {
  constructor(id: string) {
    super(PROBLEM_DETAILS.NotFound, `Stripe account with ID:${id} not found`)
  }
}

export class MissingStripeSessionUrlError extends ApplicationError {
  constructor() {
    super(PROBLEM_DETAILS.BadRequest, "The stripe session url is missing")
  }
}

export class PaymentNotFoundError extends ApplicationError {
  constructor(id: string) {
    super(PROBLEM_DETAILS.NotFound, `Payment with ID:${id} not found`)
  }
}

export class UnrefundablePaymentError extends ApplicationError {
  constructor() {
    super(PROBLEM_DETAILS.BadRequest, "The payment is not refundable")
  }
}

export class InvalidPaymentStatusError extends ApplicationError {
  constructor(wantedStatus: string) {
    super(PROBLEM_DETAILS.BadRequest, `The payment status is invalid, wanted ${wantedStatus}`)
  }
}
