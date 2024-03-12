import { BadRequestError, NotFoundError } from "../../error"

export class StripeAccountNotFoundError extends NotFoundError {
  constructor(id: string) {
    super(`Stripe account with ID:${id} not found`)
  }
}

export class MissingStripeSessionUrlError extends BadRequestError {
  constructor() {
    super("The stripe session url is missing")
  }
}

export class PaymentNotFoundError extends NotFoundError {
  constructor(id: string) {
    super(`Payment with ID:${id} not found`)
  }
}

export class UnrefundablePaymentError extends BadRequestError {
  constructor() {
    super("The payment is not refundable")
  }
}

export class InvalidPaymentStatusError extends BadRequestError {
  constructor(wantedStatus: string) {
    super(`The payment status is invalid, wanted ${wantedStatus}`)
  }
}
