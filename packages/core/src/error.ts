/**
 * Exception type modelled after RFC9457 Problem Details for HTTP APIs
 *
 * @see https://tools.ietf.org/html/rfc7807
 *
 * This implementation does not yet support the `instance` and `detail` members.
 *
 * All exceptions thrown by the application modules should be of this type in
 * order to be detailed enough for the client to understand the problem and
 * to be able to handle it properly.
 */
export class ApplicationError extends Error {
  constructor(
    public readonly type: string,
    public readonly status: number,
    public readonly title: string
  ) {
    super(title)
  }
}

export class IllegalStateError extends ApplicationError {
  constructor(description: string) {
    super("/problem/illegal-state", 500, `Illegal state reached: ${description}`)
  }
}
