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

export class PaymentNotReadyToCharge extends ApplicationError {
  constructor(id: string) {
    super(PROBLEM_DETAILS.NotFound, `Payment with id ${id} is not ready to be charged`)
  }
}
