export abstract class OwError extends Error {
  abstract readonly statusCode: number
}

export class NotFoundError extends OwError {
  statusCode = 404
}
