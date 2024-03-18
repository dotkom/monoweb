import { ApplicationError } from "../../error"
import { PROBLEM_DETAILS } from "../../problem-details-registry"

export class ProductNotFoundError extends ApplicationError {
  constructor(id: string) {
    super(PROBLEM_DETAILS.NotFound, `Product with ID:${id} not found`)
  }
}

export class ProductProviderMismatchError extends ApplicationError {
  constructor() {
    super(PROBLEM_DETAILS.BadRequest, `The given stripe public key does not match the product's stripe public key`)
  }
}
