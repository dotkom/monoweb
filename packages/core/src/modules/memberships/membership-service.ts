import { FeideDocumentation, FeideDocumentationSchema, FeideGroup, FeideProfile, FieldOfStudy, isMaster, Membership, MembershipDocumentation, UserId } from "@dotkomonline/types"
import { FeideRepository } from "../external/feide-repository"
import { MembershipRepository } from "./membership-repository"
import { Cursor } from "../../utils/db-utils"
import { env } from "@dotkomonline/env"
import jwt from "jsonwebtoken"

export function createDocumentation(groups: FeideGroup[], profile: FeideProfile): MembershipDocumentation {
  const subjects = groups
    .filter((group) => group.type === "fc:fs:emne")
    .map((group) => ({ code: group.id.split(":").slice(5)[0], name: group.displayName, year: group.membership?.notAfter ? new Date(group.membership.notAfter).getFullYear() : undefined }))

  const studyProgrammes = groups
    .filter((group) => group.type === "fc:fs:prg")
    .map((group) => ({ code: group.id.split(":").slice(5)[0], name: group.displayName }))

  const studyFields = groups
    .filter((group) => group.type === "fc:fs:fs:str")
    .map((group) => group.id.split(":").slice(5).join(":"))

  const fullName = profile.norEduPersonLegalName;
  const givenName = profile.givenName[0];
  const familyName = profile.sn[0];
  const feideUsername = profile.uid[0];

  return { subjects, studyProgrammes, studyFields, fullName, givenName, familyName, feideUsername }
}

function getStudyTypeFromStudyProgrammes(studyProgrammes: { code: string }[]): "MASTER" | "BACHELOR" | null {
  if (studyProgrammes.some(({ code }) => isMasterStudy(code))) {
    return "MASTER"
  }

  if (studyProgrammes.some(({ code }) => isBachelorStudy(code))) {
    return "BACHELOR"
  }

  return null
}

// Warning: Assumes that the user is a master student, will place all other students in "MASTER_OTHER"
function getMasterStudyProgramme(studyFieldCodes: string[]): FieldOfStudy {
  for (const code of studyFieldCodes) {
    switch (code) {
      // Current MSIT study programmes as of 2024
      case "MSIT-AI": return "MASTER_ARTIFICIAL_INTELLIGENCE"
      case "MSIT-DBS": return "MASTER_DATABASE_AND_SEARCH"
      case "MSIT-IXDGLT": return "MASTER_INTERACTION_DESIGN"
      case "MSIT-SWE": return "MASTER_SOFTWARE_ENGINEERING"

      // Old MIT study programmes
      case "MIT-KI": return "MASTER_ARTIFICIAL_INTELLIGENCE"
      case "MIT-DBS": return "MASTER_DATABASE_AND_SEARCH"
      case "MIT-ISL": return "MASTER_INTERACTION_DESIGN"
      case "MIT-PVS": return "MASTER_SOFTWARE_ENGINEERING"

      default: continue
    }
  }

  return "MASTER_OTHER"
}

export function calculateDefaultMembership({ studyProgrammes, studyFields, subjects }: MembershipDocumentation): Membership | null {
  const studyType = getStudyTypeFromStudyProgrammes(studyProgrammes)

  if (studyType === "BACHELOR") {
    const fieldOfStudy = "BACHELOR"

    const classYear = subjects
      .filter(({ year }) => year !== undefined)
      .map(({ year }) => year! - new Date().getFullYear() + 1)
      .sort((a, b) => b - a)[0] ?? 1

    return {
      fieldOfStudy,
      classYear
    }
  }

  if (studyType === "MASTER") {
    const fieldOfStudy = getMasterStudyProgramme(studyFields)

    const defaultClassYear = subjects
      .filter(({ year }) => year !== undefined)
      .map(({ year }) => year! - new Date().getFullYear() + 1)
      .sort((a, b) => b - a)[0] ?? 1
    const classYear = Math.max(4, defaultClassYear)

    return {
      fieldOfStudy,
      classYear
    }
  }

  return null
}

const MASTER_STUDY_CODES = ["MSIT", "MIT"] satisfies string[]
const BACHELOR_STUDY_CODES = ["BIT"] satisfies string[]

const isMasterStudy = (studyProgramme: string) => MASTER_STUDY_CODES.includes(studyProgramme)
const isBachelorStudy = (studyProgramme: string) => BACHELOR_STUDY_CODES.includes(studyProgramme)


export interface MembershipService {
  updateAutomatically(userId: UserId, documentationJWT: string): Promise<Membership | undefined>
  getDocumentation(userId: UserId): Promise<MembershipDocumentation>
  getById(userId: UserId): Promise<Membership | undefined>
  getAll(take: number, cursor?: Cursor): Promise<Membership[]>
  update(userId: UserId, membershipUpdate: Membership): Promise<Membership | undefined>
  delete(userId: UserId): Promise<Membership | undefined>
  create(userId: UserId, membershipInsert: Membership): Promise<Membership>
}

export class MembershipServiceImpl {
  constructor(
    private readonly membershipRepository: MembershipRepository,
    private readonly feideRepository: FeideRepository,
  ) {}

  async updateAutomatically(userId: UserId, documentationJWT: string): Promise<Membership | undefined> {
    const documentation = FeideDocumentationSchema.parse(jwt.verify(documentationJWT, env.FEIDE_JWT_SECRET) as FeideDocumentation)
    const existingMembership = await this.membershipRepository.getById(userId)
    const defaultMembership = calculateDefaultMembership(documentation)

    // If we have a membership, but don't qualify for a default membership, we keep the existing membership
    if (!defaultMembership) {
      return existingMembership
    }

    // If we don't have a membership, but qualify for a default membership, we create a new membership
    if (existingMembership === undefined) {
      return this.membershipRepository.create(userId, defaultMembership)
    }

    // Upgrade bachelor students to master students
    if (existingMembership.fieldOfStudy === "BACHELOR" && isMaster(defaultMembership.fieldOfStudy)) {
      return this.membershipRepository.update(userId, defaultMembership)
    }

    // If we have a membership, and qualify for a default membership, we update the existing membership
    // This should maybe be changed in the future, to allow for manual approval by the user before updating
    return this.membershipRepository.update(userId, defaultMembership)
  }

  async getDocumentation(accessToken: string): Promise<MembershipDocumentation> {
    const groups = await this.feideRepository.getFeideGroups(accessToken)
    const profile = await this.feideRepository.getFeideProfileInformation(accessToken)

    return createDocumentation(groups, profile)
  }

  async getById(userId: UserId): Promise<Membership | undefined> {
    return this.membershipRepository.getById(userId)
  }

  async getAll(take: number, cursor?: Cursor): Promise<Membership[]> {
    return this.membershipRepository.getAll(take, cursor)
  }

  async update(userId: UserId, membershipUpdate: Membership): Promise<Membership | undefined> {
    return this.membershipRepository.update(userId, membershipUpdate)
  }

  async delete(userId: UserId): Promise<Membership | undefined> {
    return this.membershipRepository.delete(userId)
  }

  async create(userId: UserId, membershipInsert: Membership): Promise<Membership> {
    return this.membershipRepository.create(userId, membershipInsert)
  }
}
