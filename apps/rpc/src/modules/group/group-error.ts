import { ApplicationError } from "../../error"
import { PROBLEM_DETAILS } from "../../http-problem-details"

export class GroupNotFoundError extends ApplicationError {
  constructor(id: string) {
    super(PROBLEM_DETAILS.NotFound, `Group with ID:${id} not found`)
  }
}

export class GroupMembershipNotFoundError extends ApplicationError {
  constructor(id: string) {
    super(PROBLEM_DETAILS.NotFound, `GroupMembership with ID:${id} not found`)
  }
}

export class GroupMembershipOverlap extends ApplicationError {
  constructor() {
    super(PROBLEM_DETAILS.IllegalState, "GroupMemberships can't overlap")
  }
}
