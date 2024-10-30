import { FeideDocumentation, FeideDocumentationSchema, FeideGroup, FeideProfile, Membership, MembershipDocumentation, OnlineFieldOfStudy, UserId } from "@dotkomonline/types"
import { FeideRepository } from "../external/feide-repository"
import { MembershipRepository } from "./membership-repository"
import { Cursor } from "../../utils/db-utils"
import { env } from "@dotkomonline/env"
import jwt from "jsonwebtoken"

const ONLINE_MASTER_STUDY_PROGRAMMES = ["MSIT", "MIT"] 
const ONLINE_BACHELOR_STUDY_PROGRAMMES = ["BIT"]

const BACHELOR_SUBJECT_YEARS = new Map<string, number>([
  // Autumn 1st year
  ["EXPH0300", 1], // Exphil
  ["IT2805", 1],   // Webtek
  ["MA0001", 1],   // Matte A
  ["TDT4109", 1],  // ITGK

  // Spring 1st year
  ["MA0301", 1],   // Diskmat
  ["TDT4100", 1],  // Objekt
  ["TDT4180", 1],  // MMI
  ["TTM4100", 1],  // KTN

  // Autumn 2nd year
  ["IT1901", 2],   // ITP
  ["TDT4120", 2],  // Algdat
  ["TDT4160", 2],  // Datamaskiner
  ["BI2081", 2],   // Områdeemne 1
  ["IØ200", 2],    // Områdeemne 2
  ["ØKO1001", 2],  // Områdeemne 3

  // Spring 2nd year
  ["TDT4140", 2],  // PU
  ["TDT4145", 2],  // Databaser

  // Spring 3rd year
  ["IT2901", 3],   // Bacheloroppgave
])

function mostCommonNumber(numbers: number[]): number | null {
  if (numbers.length === 0) {
    return null
  }
  return numbers
    .reduce((acc, number) => {
      acc.set(number, (acc.get(number) ?? 0) + 1)
      return acc
    }, new Map<number, number>())
    .entries()
    .reduce((acc, [number, count]) => count > acc[1] ? [number, count] : acc, [0, 0])[0]
}

export function getMembershipYear(membership: Membership): number | null {
  let currentYear = new Date().getFullYear();
  let yearsSinceStart = currentYear - membership.classYear;

  // Social and full members are members 1st-5th year
  if (membership.socialMembership || membership.extraordinaryFullMembership) {
    return Math.min(yearsSinceStart, 5)
  }

  // Bachelor students are members 1st-3rd year
  if (membership.onlineFieldOfStudy === "BACHELOR_INFORMATICS" && yearsSinceStart <= 3) {
    return yearsSinceStart
  }

  // Bachelor students are counted as 3rd year members on their 4th year if they have not graduated
  if (membership.onlineFieldOfStudy === "BACHELOR_INFORMATICS" && yearsSinceStart === 4) {
    return 3
  }

  // Master students are members 4th-5th year
  if (membership.onlineFieldOfStudy === "MASTER_INFORMATICS" && yearsSinceStart >= 4) {
    return Math.min(yearsSinceStart, 5)
  }

  if (membership.onlineFieldOfStudy === "PHD") {
    return 6
  }

  return null
}

export function createDocumentation(groups: FeideGroup[], profile: FeideProfile): MembershipDocumentation {
  // Subjects at NTNU have end date in august if they are finished in the spring semester
  // and in december if they are finished in the autumn semester
  const getSubjectYearFromEnddate = (endDate: Date) => {
    if (endDate.getMonth() < 10) {
      return endDate.getFullYear() - 1
    } else {
      return endDate.getFullYear()
    }
  }

  const subjects = groups
    .filter((group) => group.type === "fc:fs:emne")
    .map((group) => {
      if (group.id.includes("MA0301")) {
        console.log("MATTTE")
        console.log(new Date(group.membership?.notAfter!).getMonth() < 10)
        console.log(getSubjectYearFromEnddate(new Date(group.membership?.notAfter!)))
      }
      return ({
      code: group.id.split(":").slice(5)[0],
      name: group.displayName,
      year: group.membership?.notAfter ? getSubjectYearFromEnddate(new Date(group.membership.notAfter)) : undefined
    })})

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

function findOnlineFieldOfStudy(studyProgrammes: MembershipDocumentation["studyProgrammes"]): OnlineFieldOfStudy | null {
  if (studyProgrammes.some((programme) => ONLINE_MASTER_STUDY_PROGRAMMES.includes(programme.code))) {
    return "MASTER_INFORMATICS"
  }

  if (studyProgrammes.some((programme) => ONLINE_BACHELOR_STUDY_PROGRAMMES.includes(programme.code))) {
    return "BACHELOR_INFORMATICS"
  }

  return null
}

function findEarliestYearFinishedSubject(subjects: MembershipDocumentation["subjects"]): number | null {
  return subjects
    .filter(({ year }) => year !== undefined)
    .map(({ year }) => year!)
    .sort((a, b) => a - b)[0] ?? null
}

export function calculateDefaultMembership({ studyProgrammes, studyFields, subjects }: MembershipDocumentation): Membership | null {
  const onlineFieldOfStudy = findOnlineFieldOfStudy(studyProgrammes)
  const studyprogrammeCodes = studyProgrammes.map((programme) => programme.code)

  let classYear: number | null = null

  if (onlineFieldOfStudy === "BACHELOR_INFORMATICS") {
    // Find out which year the student finished their obligatory subjects, and compare to a
    // normal bachelor student to estimate which year they are probably in

    const suggestedYears = []
    for (const subject of subjects) {
      const normalYear = BACHELOR_SUBJECT_YEARS.get(subject.code)

      // Does not have a confirmed end date
      if (subject.year === undefined) {
        continue
      }

      // Is not a obligatory subject
      if (normalYear === undefined) {
        continue
      }

      suggestedYears.push(subject.year - normalYear + 1)
      console.log(`${subject.code} suggests year ${subject.year - normalYear + 1}`)
    }

    classYear = mostCommonNumber(suggestedYears) ?? 1
  }

  if (onlineFieldOfStudy === "MASTER_INFORMATICS") {
    classYear = new Date().getFullYear() - 4
  }

  if (onlineFieldOfStudy === "PHD") {
    classYear = new Date().getFullYear() - 6
  }

  if (classYear === null) {
    classYear = new Date().getFullYear()
  }

  return {
    onlineFieldOfStudy,
    classYear,
    socialMembership: false,
    extraordinaryFullMembership: false,
    studyprogrammeCodes,
  }
}


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
    if (existingMembership.onlineFieldOfStudy === "MASTER_INFORMATICS") {
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
