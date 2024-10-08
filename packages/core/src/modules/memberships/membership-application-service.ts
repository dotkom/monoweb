import type { MembershipApplication, UserId } from "@dotkomonline/types"
import type { MembershipApplicationRepository } from "./membership-application-repository"
import { Cursor } from "../../utils/db-utils"

export interface MembershipApplicationService {
  getById(id: UserId): Promise<MembershipApplication | undefined>
  getAll(take: number, cursor?: Cursor): Promise<MembershipApplication[]>
  create(membershipRequestInsert: MembershipApplication): Promise<MembershipApplication>
  update(id: UserId, membershipRequestUpdate: MembershipApplication): Promise<MembershipApplication | undefined>
  delete(id: UserId): Promise<MembershipApplication | undefined>
}

export class MembershipApplicationServiceImpl implements MembershipApplicationService {
  constructor(private readonly membershipApplicationRepository: MembershipApplicationRepository) {}

  getById(id: UserId): Promise<MembershipApplication | undefined> {
    return this.membershipApplicationRepository.getById(id)
  }

  getAll(take: number, cursor?: Cursor): Promise<MembershipApplication[]> {
    return this.membershipApplicationRepository.getAll(take, cursor)
  }

  update(id: UserId, membershipRequestUpdate: MembershipApplication): Promise<MembershipApplication | undefined> {
    return this.membershipApplicationRepository.update(id, membershipRequestUpdate)
  }

  delete(id: UserId): Promise<MembershipApplication | undefined> {
    return this.membershipApplicationRepository.delete(id)
  }

  create(membershipRequestInsert: MembershipApplication): Promise<MembershipApplication> {
    return this.membershipApplicationRepository.create(membershipRequestInsert)
  }
}
