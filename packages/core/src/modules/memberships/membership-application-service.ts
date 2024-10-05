import type { MembershipApplication } from "@dotkomonline/types"
import type { MembershipApplicationRepository } from "./membership-application-repository"

export interface MembershipApplicationService {
  create(membershipRequestInsert: MembershipApplication): Promise<MembershipApplication>
}

export class MembershipApplicationServiceImpl implements MembershipApplicationService {
  constructor(private readonly membershipApplicationRepository: MembershipApplicationRepository) {}

  create(membershipRequestInsert: MembershipApplication): Promise<MembershipApplication> {
    return this.membershipApplicationRepository.create(membershipRequestInsert)
  }
}
