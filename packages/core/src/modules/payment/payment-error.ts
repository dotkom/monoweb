import { ApplicationError } from "../../error"

export class StripeAccountNotFoundError extends ApplicationError {
  constructor(id: string) {
    super("/problem/not-found", 404, `Stripe account with ID:${id} not found`)
  }
}

export class MissingStripeSessionUrlError extends ApplicationError {
  constructor() {
    super("/problem/bad-request", 400, "The stripe session url is missing")
  }
}

export class PaymentNotFoundError extends ApplicationError {
  constructor(id: string) {
    super("/problem/not-found", 404, `Payment with ID:${id} not found`)
  }
}

export class UnrefundablePaymentError extends ApplicationError {
  constructor() {
    super("/problem/bad-request", 400, "The payment is not refundable")
  }
}

export class InvalidPaymentStatusError extends ApplicationError {
  constructor(wantedStatus: string) {
    super("/problem/bad-request", 400, `The payment status is invalid, wanted ${wantedStatus}`)
  }
}
