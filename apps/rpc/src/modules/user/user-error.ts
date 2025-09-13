import { ApplicationError } from "../../error.ts"
import { PROBLEM_DETAILS } from "../../http-problem-details.ts"

export class UserNotFoundError extends ApplicationError {
  constructor(id: string) {
    super(PROBLEM_DETAILS.NotFound, `User with ID: '${id}' not found`)
  }
}

export class UserFetchError extends ApplicationError {
  constructor(id: string, status: number, statusText: string) {
    super(PROBLEM_DETAILS.InternalServerError, `Failed to fetch user with ID '${id}': ${status} ${statusText}`)
  }
}

export class BulkUserFetchError extends ApplicationError {
  constructor(status: number, statusText: string) {
    super(PROBLEM_DETAILS.InternalServerError, `Failed to fetch users: ${status} ${statusText}`)
  }
}

export class UserCreationError extends ApplicationError {
  constructor(status: number, statusText: string) {
    super(PROBLEM_DETAILS.InternalServerError, `Failed to create user: ${status} ${statusText}`)
  }
}

export class UserUpdateError extends ApplicationError {
  constructor(userId: string, description: string) {
    super(PROBLEM_DETAILS.BadRequest, `Failed to update user with ID '${userId}': ${description}`)
  }
}

export class UserNoFeideTokenError extends ApplicationError {
  constructor(id: string) {
    super(PROBLEM_DETAILS.BadRequest, `User with ID:${id} does not have a stored FEIDE token`)
  }
}
