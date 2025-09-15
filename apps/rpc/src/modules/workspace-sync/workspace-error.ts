import { ApplicationError } from "../../error"
import { PROBLEM_DETAILS } from "../../http-problem-details"

export class WorkspaceNotEnabledError extends ApplicationError {
  constructor() {
    super(PROBLEM_DETAILS.IllegalState, "Workspace is not enabled")
  }
}

export class WorkspaceDirectoryNotAvailableError extends ApplicationError {
  constructor() {
    super(PROBLEM_DETAILS.IllegalState, "Workspace directory is not available")
  }
}

export class MalformedWorkspaceServiceAccountError extends ApplicationError {
  constructor(message: string) {
    super(PROBLEM_DETAILS.IllegalState, `Workspace Service Account is malformed: ${message}`)
  }
}

export class WorkspaceUserNotFoundError extends ApplicationError {
  constructor(key: string) {
    super(PROBLEM_DETAILS.NotFound, `WorkspaceUser(Key=${key}) not found`)
  }
}
