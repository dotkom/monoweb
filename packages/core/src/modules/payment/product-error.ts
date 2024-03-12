import { ApplicationError } from "../../error"

export class ProductNotFoundError extends ApplicationError {
  constructor(id: string) {
    super("/problem/not-found", 404, `Product with ID:${id} not found`)
  }
}

export class ProductProviderMismatchError extends ApplicationError {
  constructor() {
    super("/problem/bad-request", 400, `The given stripe public key does not match the product's stripe public key`)
  }
}
