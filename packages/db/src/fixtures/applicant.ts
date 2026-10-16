import { TZDate } from "@date-fns/tz"
import { base, en, Faker, nb_NO } from "@faker-js/faker"
import { getCurrentSemesterStart, getNextSemesterStart, isSpringSemester } from "@dotkomonline/utils"
import { addBusinessDays, addMinutes, addWeeks, set, startOfWeek, subDays, subMonths } from "date-fns"
import {
  CommitteeApplicationGroupType,
  CommitteeApplicationInterviewDuration,
  Gender,
  MembershipSpecialization,
  MembershipType,
  type Prisma,
} from "../"

// Bulk fixtures for testing the committee application flow end to end. They are applied on top of the primary
// fixtures (`pnpm migrate:dev-with-applicant-fixtures` applies both), and every row they create is identifiable so it
// can be removed again: users have emails on APPLICANT_FIXTURE_EMAIL_DOMAIN and the periods have the fixed IDs below.

export const APPLICANT_FIXTURE_EMAIL_DOMAIN = "opptak.example.com"

export const APPLICANT_FIXTURE_PERIOD_IDS = {
  open: "0f5e8a4c-2d1b-4c3a-9e7f-6a5b4c3d2e01",
  readyForMatching: "0f5e8a4c-2d1b-4c3a-9e7f-6a5b4c3d2e02",
  matched: "0f5e8a4c-2d1b-4c3a-9e7f-6a5b4c3d2e03",
  published: "0f5e8a4c-2d1b-4c3a-9e7f-6a5b4c3d2e04",
} as const

export const APPLICANT_FIXTURE_GROUP_SLUGS = [
  "appkom",
  "arrkom",
  "bedkom",
  "dotkom",
  "fagkom",
  "oil",
  "prokom",
  "redaksjonen",
  "trikom",
  "backlog",
  "dotdagene",
  "feminit",
] as const

export const APPLICANTS_PER_PERIOD = 250

const SEED = 935
const TIME_ZONE = "Europe/Oslo"
const APPLICANT_POOL_SIZE = 800
const INTERVIEW_DAYS = 10
const APPLICANT_BUFFER_MINUTES = 15
const ADDITIVE_GROUP_SLUGS = new Set<string>(["backlog", "dotdagene", "feminit"])

// Real rooms on Gløshaugen, so the MazeMap links in the admin panel point somewhere sensible.
const ROOMS = [
  { name: "Realfagbygget A4-100", poiId: 1000292427 },
  { name: "Realfagbygget A4-119", poiId: 1000292364 },
  { name: "Realfagbygget A4-121", poiId: 1000292464 },
  { name: "Realfagbygget A4-124", poiId: 1000292559 },
  { name: "Realfagbygget A4-132", poiId: 1000292553 },
  { name: "Realfagbygget A4-138", poiId: 1000292558 },
  { name: "Realfagbygget A4-145", poiId: 1000292376 },
  { name: "Realfagbygget A4-147", poiId: 1000292435 },
  { name: "Realfagbygget A3-141", poiId: 6391 },
  { name: "Realfagbygget C3-118", poiId: 7120 },
  { name: "Realfagbygget B1-183C", poiId: 73110 },
  { name: "Kjelhuset KJEL21", poiId: 6656 },
]

type Stage = keyof typeof APPLICANT_FIXTURE_PERIOD_IDS

type UserFixture = Prisma.UserCreateManyInput & { id: string; gender: Gender; email: string }
type PeriodFixture = Prisma.CommitteeApplicationPeriodCreateManyInput & {
  id: string
  applicationsOpenAt: Date
  applicationsCloseAt: Date
  interviewsStartDate: Date
  interviewsEndDate: Date
  interviewsPublishedAt: Date | null
}
type GroupFixture = Prisma.CommitteeApplicationGroupCreateManyInput & {
  id: string
  applicationPeriodId: string
  interviewDuration: CommitteeApplicationInterviewDuration
}
type ApplicationFixture = Prisma.CommitteeApplicationCreateManyInput & {
  id: string
  createdAt: Date
  studyYear: number
}
type GroupSelectionFixture = Prisma.CommitteeApplicationGroupSelectionCreateManyInput & {
  id: string
  applicationPeriodId: string
}
type AvailabilityFixture = Prisma.CommitteeApplicationAvailabilityCreateManyInput & {
  startsAt: Date
  endsAt: Date
}
type InterviewBlockFixture = Prisma.CommitteeApplicationInterviewBlockCreateManyInput & {
  id: string
  startsAt: Date
  endsAt: Date
}
type InterviewFixture = Prisma.CommitteeApplicationInterviewCreateManyInput & {
  id: string
  startsAt: Date
  endsAt: Date
}

interface PeriodPlan {
  stage: Stage
  name: string
  applicationsOpenAt: TZDate
  applicationsCloseAt: TZDate
  firstInterviewDay: TZDate
  interviewsPublishedAt: Date | null
}

// Prisma DATE columns need UTC midnight for the intended calendar date, rather than an Oslo midnight instant.
function toDateOnly(date: TZDate) {
  return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
}

function atTime(date: TZDate, hours: number, minutes = 0) {
  return set(date, { hours, minutes, seconds: 0, milliseconds: 0 })
}

function toEmailPart(value: string) {
  return value
    .toLowerCase()
    .replace(/æ/g, "ae")
    .replace(/ø/g, "o")
    .replace(/å/g, "a")
    .normalize("NFD")
    .replace(/[^a-z]/g, "")
}

function getPeriodPlans(now: TZDate): PeriodPlan[] {
  const nextMonday = new TZDate(startOfWeek(addWeeks(now, 1), { weekStartsOn: 1 }), TIME_ZONE)
  const openPeriodCloseAt = atTime(addBusinessDays(now, 5), 23, 59)

  return [
    {
      stage: "open",
      name: "Komitéopptak (testdata) – åpen",
      applicationsOpenAt: atTime(subDays(now, 4), 0),
      applicationsCloseAt: openPeriodCloseAt,
      firstInterviewDay: startOfWeek(addWeeks(openPeriodCloseAt, 1), { weekStartsOn: 1 }),
      interviewsPublishedAt: null,
    },
    {
      stage: "readyForMatching",
      name: "Komitéopptak (testdata) – klar for matching",
      applicationsOpenAt: atTime(subDays(now, 21), 0),
      applicationsCloseAt: atTime(subDays(now, 1), 22),
      firstInterviewDay: nextMonday,
      interviewsPublishedAt: null,
    },
    {
      stage: "matched",
      name: "Komitéopptak (testdata) – matchet",
      applicationsOpenAt: atTime(subDays(now, 28), 0),
      applicationsCloseAt: atTime(subDays(now, 3), 22),
      firstInterviewDay: nextMonday,
      interviewsPublishedAt: null,
    },
    {
      stage: "published",
      name: "Komitéopptak (testdata) – publisert",
      applicationsOpenAt: atTime(subDays(now, 35), 0),
      applicationsCloseAt: atTime(subDays(now, 7), 22),
      firstInterviewDay: nextMonday,
      interviewsPublishedAt: new Date(atTime(subDays(now, 1), 12)),
    },
  ]
}

function createUsers(faker: Faker) {
  const users: UserFixture[] = []
  const studyYears = new Map<string, number>()

  const createUser = (index: number, studyYear: number) => {
    const sex = faker.person.sexType()
    const firstName = faker.person.firstName(sex)
    const lastName = faker.person.lastName()
    const handle = `${toEmailPart(firstName)}.${toEmailPart(lastName)}.${index}`
    const user: UserFixture = {
      id: faker.string.uuid(),
      username: `opptak-${handle.replaceAll(".", "-")}`,
      name: `${firstName} ${lastName}`,
      email: `${handle}@${APPLICANT_FIXTURE_EMAIL_DOMAIN}`,
      phone: `+47 ${faker.helpers.arrayElement(["4", "9"])}${faker.string.numeric(2)} ${faker.string.numeric(2)} ${faker.string.numeric(3)}`,
      gender: sex === "female" ? Gender.FEMALE : Gender.MALE,
      imageUrl: null,
      biography: null,
      dietaryRestrictions: null,
      ntnuUsername: null,
      privacyPermissionsId: faker.string.uuid(),
      notificationPermissionsId: faker.string.uuid(),
    }

    users.push(user)
    studyYears.set(user.id, studyYear)

    return user
  }

  const applicantPool = Array.from({ length: APPLICANT_POOL_SIZE }, (_, index) =>
    createUser(
      index,
      faker.helpers.weightedArrayElement([
        { value: 1, weight: 45 },
        { value: 2, weight: 30 },
        { value: 3, weight: 12 },
        { value: 4, weight: 8 },
        { value: 5, weight: 5 },
      ])
    )
  )

  const membersByGroup = new Map<string, UserFixture[]>()

  for (const slug of APPLICANT_FIXTURE_GROUP_SLUGS) {
    const memberCount = faker.number.int({ min: 10, max: 15 })
    membersByGroup.set(
      slug,
      Array.from({ length: memberCount }, () => createUser(users.length, faker.number.int({ min: 2, max: 5 })))
    )
  }

  return { users, studyYears, applicantPool, membersByGroup }
}

function getMembership(userId: string, studyYear: number): Prisma.MembershipCreateManyInput {
  const semester = (studyYear - 1) * 2 + (isSpringSemester() ? 1 : 0)
  const isMaster = studyYear > 3

  return {
    userId,
    type: isMaster ? MembershipType.MASTER_STUDENT : MembershipType.BACHELOR_STUDENT,
    specialization: isMaster ? MembershipSpecialization.SOFTWARE_ENGINEERING : null,
    start: getCurrentSemesterStart(),
    end: getNextSemesterStart(),
    semester,
  }
}

function selectGroups(faker: Faker, groups: GroupFixture[], count: number, popularity: Map<string, number>) {
  const remainingGroups = [...groups]
  const selectedGroups: GroupFixture[] = []

  while (selectedGroups.length < count && remainingGroups.length > 0) {
    const selectedGroup = faker.helpers.weightedArrayElement(
      remainingGroups.map((group) => ({ value: group, weight: popularity.get(group.id) ?? 1 }))
    )

    selectedGroups.push(selectedGroup)
    remainingGroups.splice(remainingGroups.indexOf(selectedGroup), 1)
  }

  return selectedGroups
}

function getDurationMinutes(group: GroupFixture) {
  return group.interviewDuration === CommitteeApplicationInterviewDuration.MINUTES_30 ? 30 : 20
}

function createPeriod(
  faker: Faker,
  plan: PeriodPlan,
  now: Date,
  applicantPool: UserFixture[],
  studyYears: Map<string, number>,
  membersByGroup: Map<string, UserFixture[]>
) {
  const periodId = APPLICANT_FIXTURE_PERIOD_IDS[plan.stage]
  const interviewDays = Array.from({ length: INTERVIEW_DAYS }, (_, dayIndex) =>
    addBusinessDays(plan.firstInterviewDay, dayIndex)
  )

  const period: PeriodFixture = {
    id: periodId,
    name: plan.name,
    isDraft: false,
    isEnabled: true,
    applicationsOpenAt: new Date(plan.applicationsOpenAt),
    applicationsCloseAt: new Date(plan.applicationsCloseAt),
    interviewsStartDate: toDateOnly(interviewDays[0]),
    interviewsEndDate: toDateOnly(interviewDays[interviewDays.length - 1]),
    interviewsPublishedAt: plan.interviewsPublishedAt,
  }

  const groups: GroupFixture[] = APPLICANT_FIXTURE_GROUP_SLUGS.map((slug) => ({
    id: faker.string.uuid(),
    groupId: slug,
    applicationPeriodId: periodId,
    type: ADDITIVE_GROUP_SLUGS.has(slug)
      ? CommitteeApplicationGroupType.ADDITIVE
      : CommitteeApplicationGroupType.EXCLUSIVE,
    interviewDuration: faker.helpers.arrayElement([
      CommitteeApplicationInterviewDuration.MINUTES_20,
      CommitteeApplicationInterviewDuration.MINUTES_30,
    ]),
  }))

  // Different popularity weights produce quieter and busier committees.
  const popularity = new Map(groups.map((group) => [group.id, faker.number.int({ min: 1, max: 10 })]))
  const exclusiveGroups = groups.filter((group) => group.type === CommitteeApplicationGroupType.EXCLUSIVE)
  const applicationsCloseAt = Math.min(now.getTime(), period.applicationsCloseAt.getTime())

  const applications: ApplicationFixture[] = []
  const groupSelections: GroupSelectionFixture[] = []
  const availabilityBlocks: AvailabilityFixture[] = []

  for (const applicant of faker.helpers.arrayElements(applicantPool, APPLICANTS_PER_PERIOD)) {
    const eligibleAdditiveGroups = groups.filter(
      (group) =>
        group.type === CommitteeApplicationGroupType.ADDITIVE &&
        (group.groupId !== "feminit" || applicant.gender === Gender.FEMALE)
    )
    const exclusiveCount = faker.helpers.weightedArrayElement([
      { value: 0, weight: 1 },
      { value: 1, weight: 3 },
      { value: 2, weight: 4 },
      { value: 3, weight: 4 },
    ])
    const additiveCount = faker.number.int({
      min: exclusiveCount === 0 ? 1 : 0,
      max: exclusiveCount === 0 ? eligibleAdditiveGroups.length : 1,
    })
    const createdAt = faker.date.between({ from: period.applicationsOpenAt, to: applicationsCloseAt })
    const applicationId = faker.string.uuid()

    applications.push({
      id: applicationId,
      createdAt,
      updatedAt: createdAt,
      aboutMe: faker.lorem.paragraphs(faker.number.int({ min: 1, max: 3 })),
      studyYear: studyYears.get(applicant.id) ?? 1,
      userId: applicant.id,
      applicationPeriodId: periodId,
    })

    let nextRank = 1

    for (const group of selectGroups(faker, exclusiveGroups, exclusiveCount, popularity)) {
      groupSelections.push({
        id: faker.string.uuid(),
        applicationId,
        applicationGroupId: group.id,
        applicationPeriodId: periodId,
        rank: nextRank,
      })
      nextRank += 1
    }

    for (const group of selectGroups(faker, eligibleAdditiveGroups, additiveCount, popularity)) {
      groupSelections.push({
        id: faker.string.uuid(),
        applicationId,
        applicationGroupId: group.id,
        applicationPeriodId: periodId,
        rank: null,
      })
    }

    // One window per available day, on at least three of the interview days.
    const availableDays = interviewDays.filter(() => faker.datatype.boolean({ probability: 0.5 }))
    const missingDays = faker.helpers.arrayElements(
      interviewDays.filter((day) => !availableDays.includes(day)),
      Math.max(0, 3 - availableDays.length)
    )

    for (const day of [...availableDays, ...missingDays].toSorted(
      (first, second) => first.getTime() - second.getTime()
    )) {
      const startHalfHour = faker.number.int({ min: 18, max: 26 })
      const endHalfHour = faker.number.int({ min: startHalfHour + 4, max: 34 })

      availabilityBlocks.push({
        id: faker.string.uuid(),
        applicationId,
        startsAt: new Date(atTime(day, Math.floor(startHalfHour / 2), (startHalfHour % 2) * 30)),
        endsAt: new Date(atTime(day, Math.floor(endHalfHour / 2), (endHalfHour % 2) * 30)),
      })
    }
  }

  // Committees reserve one block per day in their own room, with enough capacity for everyone who applied. In the open
  // period only some committees have done so yet.
  const interviewBlocks: InterviewBlockFixture[] = []
  const groupsWithBlocks =
    plan.stage === "open" ? faker.helpers.arrayElements(groups, Math.floor(groups.length / 2)) : groups

  for (const group of groupsWithBlocks) {
    const room = ROOMS[groups.indexOf(group)]
    const demand = groupSelections.filter((selection) => selection.applicationGroupId === group.id).length
    const requiredMinutes = Math.max(demand * getDurationMinutes(group) * 1.5, 180)
    let reservedMinutes = 0

    for (const day of faker.helpers.shuffle(interviewDays)) {
      if (reservedMinutes >= requiredMinutes) {
        break
      }

      const [startHour, endHour] = faker.helpers.arrayElement([
        [9, 12],
        [12, 16],
        [9, 16],
        [10, 17],
      ])

      interviewBlocks.push({
        id: faker.string.uuid(),
        applicationGroupId: group.id,
        startsAt: new Date(atTime(day, startHour)),
        endsAt: new Date(atTime(day, endHour)),
        locationName: room.name,
        locationUrl: `https://use.mazemap.com/#v=1&campusid=1&sharepoitype=poi&sharepoi=${room.poiId}`,
      })
      reservedMinutes += (endHour - startHour) * 60
    }
  }

  const interviews =
    plan.stage === "matched" || plan.stage === "published"
      ? scheduleInterviews(faker, groups, groupSelections, availabilityBlocks, interviewBlocks)
      : []

  // Committee members sign up to sit in on interviews once applications have closed.
  const interviewAttendees: Prisma.CommitteeApplicationInterviewAttendeeCreateManyInput[] = []

  if (plan.stage !== "open") {
    for (const selection of groupSelections) {
      const group = groups.find((candidate) => candidate.id === selection.applicationGroupId)
      const members = membersByGroup.get(group?.groupId ?? "") ?? []

      if (!faker.datatype.boolean({ probability: 0.6 })) {
        continue
      }

      for (const member of faker.helpers.arrayElements(members, { min: 1, max: 3 })) {
        interviewAttendees.push({ groupSelectionId: selection.id, userId: member.id })
      }
    }
  }

  return {
    period,
    groups,
    applications,
    groupSelections,
    availabilityBlocks,
    interviewBlocks,
    interviews,
    interviewAttendees,
  }
}

// A greedy stand-in for the real matching algorithm (which lives in rpc), obeying the rules the backend checks when
// interviews are confirmed: the slot fits in the committee's block and the applicant's availability, and applicants get
// a buffer between interviews. A few selections are deliberately left unmatched so the unmatched lists are not empty.
function scheduleInterviews(
  faker: Faker,
  groups: GroupFixture[],
  groupSelections: GroupSelectionFixture[],
  availabilityBlocks: AvailabilityFixture[],
  interviewBlocks: InterviewBlockFixture[]
) {
  const interviews: InterviewFixture[] = []
  const takenSlots = new Set<string>()
  const applicantInterviews = new Map<string, InterviewFixture[]>()
  // Ranks only matter later in the process, so like the real matching, every selection gets the same chance at a slot.
  for (const selection of faker.helpers.shuffle(groupSelections)) {
    if (faker.datatype.boolean({ probability: 0.04 })) {
      continue
    }

    const group = groups.find((candidate) => candidate.id === selection.applicationGroupId)

    if (group === undefined) {
      continue
    }

    const durationMinutes = getDurationMinutes(group)
    const availability = availabilityBlocks.filter((block) => block.applicationId === selection.applicationId)
    const bookedInterviews = applicantInterviews.get(selection.applicationId) ?? []
    const blocks = interviewBlocks
      .filter((block) => block.applicationGroupId === group.id)
      .toSorted((first, second) => first.startsAt.getTime() - second.startsAt.getTime())

    findSlot: for (const block of blocks) {
      for (
        let startsAt = block.startsAt;
        addMinutes(startsAt, durationMinutes) <= block.endsAt;
        startsAt = addMinutes(startsAt, durationMinutes)
      ) {
        const endsAt = addMinutes(startsAt, durationMinutes)
        const slotKey = `${block.id}|${startsAt.getTime()}`
        const isAvailable = availability.some((window) => window.startsAt <= startsAt && window.endsAt >= endsAt)
        const hasBuffer = bookedInterviews.every(
          (interview) =>
            startsAt >= addMinutes(interview.endsAt, APPLICANT_BUFFER_MINUTES) ||
            endsAt <= addMinutes(interview.startsAt, -APPLICANT_BUFFER_MINUTES)
        )

        if (takenSlots.has(slotKey) || !isAvailable || !hasBuffer) {
          continue
        }

        const interview: InterviewFixture = {
          id: faker.string.uuid(),
          groupSelectionId: selection.id,
          applicationGroupId: group.id,
          interviewBlockId: block.id,
          startsAt,
          endsAt,
        }

        interviews.push(interview)
        takenSlots.add(slotKey)
        bookedInterviews.push(interview)
        applicantInterviews.set(selection.applicationId, bookedInterviews)
        break findSlot
      }
    }
  }

  return interviews
}

export function getApplicantFixtures(currentTime = new Date()) {
  const faker = new Faker({ locale: [nb_NO, en, base] })
  faker.seed(SEED)

  // Users are generated before anything time dependent, so their IDs stay the same no matter when fixtures are applied.
  const { users, studyYears, applicantPool, membersByGroup } = createUsers(faker)
  const now = new TZDate(currentTime, TIME_ZONE)

  const groupMemberships: Prisma.GroupMembershipCreateManyInput[] = []

  for (const [slug, members] of membersByGroup) {
    for (const member of members) {
      groupMemberships.push({
        id: faker.string.uuid(),
        userId: member.id,
        groupId: slug,
        start: subMonths(currentTime, faker.number.int({ min: 1, max: 24 })),
        end: null,
      })
    }
  }

  const periods = getPeriodPlans(now).map((plan) =>
    createPeriod(faker, plan, currentTime, applicantPool, studyYears, membersByGroup)
  )

  return {
    users,
    memberships: users.map((user) => getMembership(user.id, studyYears.get(user.id) ?? 1)),
    privacyPermissions: users.map((user) => ({
      id: user.privacyPermissionsId as string,
      userId: user.id,
      profileVisible: true,
      usernameVisible: true,
      emailVisible: false,
      phoneVisible: false,
      addressVisible: false,
      attendanceVisible: true,
    })) satisfies Prisma.PrivacyPermissionsCreateManyInput[],
    notificationPermissions: users.map((user) => ({
      id: user.notificationPermissionsId as string,
      userId: user.id,
    })) satisfies Prisma.NotificationPermissionsCreateManyInput[],
    groupMemberships,
    periods: periods.map(({ period }) => period),
    groups: periods.flatMap(({ groups }) => groups),
    applications: periods.flatMap(({ applications }) => applications),
    groupSelections: periods.flatMap(({ groupSelections }) => groupSelections),
    availabilityBlocks: periods.flatMap(({ availabilityBlocks }) => availabilityBlocks),
    interviewBlocks: periods.flatMap(({ interviewBlocks }) => interviewBlocks),
    interviews: periods.flatMap(({ interviews }) => interviews),
    interviewAttendees: periods.flatMap(({ interviewAttendees }) => interviewAttendees),
  }
}
