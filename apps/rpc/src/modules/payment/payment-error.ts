import { ApplicationError } from "../../error"
import { PROBLEM_DETAILS } from "../../http-problem-details"

export class PaymentMissingPriceError extends ApplicationError {
  constructor(id: string) {
    super(PROBLEM_DETAILS.NotFound, `Payment with id ${id} has no active prices`)
  }
}

export class PaymentAmbiguousPriceError extends ApplicationError {
  constructor(id: string) {
    super(PROBLEM_DETAILS.NotFound, `Payment with id ${id} has unclear cost because it has multiple active prices`)
  }
}

export class PaymentAlreadyChargedError extends ApplicationError {
  constructor(id: string) {
    super(PROBLEM_DETAILS.NotFound, `Payment with id ${id} has already been charged`)
  }
}

export class PaymentUnexpectedStateError extends ApplicationError {
  constructor(id: string, message: string) {
    super(PROBLEM_DETAILS.NotFound, `Payment with id ${id} had an unexpected state: ${message}`)
  }
}

export class PaymentNotReadyToChargeError extends ApplicationError {
  constructor(id: string) {
    super(PROBLEM_DETAILS.NotFound, `Payment with id ${id} is not ready to be charged`)
  }
}

export class PaymentNotChargedError extends ApplicationError {
  constructor(id: string) {
    super(PROBLEM_DETAILS.NotFound, `Payment with id ${id} has not been charged and cannot be refunded`)
  }
}
