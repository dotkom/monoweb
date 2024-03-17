import { BadRequestError, NotFoundError } from "../../error"

export class ProductNotFoundError extends NotFoundError {
  constructor(id: string) {
    super(`Product with ID:${id} not found`)
  }
}

export class ProductProviderMismatchError extends BadRequestError {
  constructor() {
    super(`The given stripe public key does not match the product's stripe public key`)
  }
}
