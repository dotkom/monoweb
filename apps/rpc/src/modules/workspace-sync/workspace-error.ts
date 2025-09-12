import { ApplicationError } from "../../error"
import { PROBLEM_DETAILS } from "../../http-problem-details"

export class SyncNotEnabledError extends ApplicationError {
  constructor() {
    super(PROBLEM_DETAILS.IllegalState, "Sync is not enabled")
  }
}

export class MalformedWorkspaceSyncServiceAccountError extends ApplicationError {
  constructor(message: string) {
    super(PROBLEM_DETAILS.IllegalState, `Workspace Sync Service Account is malformed: ${message}`)
  }
}

export class WorkspaceUserNotFoundError extends ApplicationError {
  constructor(key: string) {
    super(PROBLEM_DETAILS.NotFound, `Workspace user for key="${key}" not found`)
  }
}
