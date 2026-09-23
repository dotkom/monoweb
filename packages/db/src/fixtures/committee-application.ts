import { TZDate } from "@date-fns/tz"
import { faker } from "@faker-js/faker"
import {
  addBusinessDays,
  addDays,
  addHours,
  addMinutes,
  format,
  isSameDay,
  set,
  startOfDay,
  startOfWeek,
} from "date-fns"
import {
  CommitteeApplicationGroupType,
  CommitteeApplicationInterviewDuration,
  Gender,
  type Prisma,
  type User,
} from "../"

export const COMMITTEE_APPLICATION_PERIOD_FIXTURE_ID = "b290281e-685a-4eaa-81eb-240808c219fa"

const TIME_ZONE = "Europe/Oslo"

const exclusiveGroupSlugs = ["appkom", "arrkom", "bedkom", "dotkom", "fagkom", "oil", "prokom", "redaksjonen", "trikom"]
const additiveGroupSlugs = ["backlog", "dotdagene", "feminit"]

type ApplicationGroupFixture = Prisma.CommitteeApplicationGroupCreateManyInput & { id: string }
type GroupSelectionFixture = Prisma.CommitteeApplicationGroupSelectionCreateManyInput & { id: string }
type InterviewFixture = Prisma.CommitteeApplicationInterviewCreateManyInput & { startsAt: Date; endsAt: Date }
type InterviewBlockFixture = Prisma.CommitteeApplicationInterviewBlockCreateManyInput & {
  id: string
  startsAt: Date
  endsAt: Date
}

function selectGroups(groups: ApplicationGroupFixture[], count: number, popularity: Map<string, number>) {
  const remainingGroups = [...groups]
  const selectedGroups: ApplicationGroupFixture[] = []

  while (selectedGroups.length < count) {
    const selectedGroup = faker.helpers.weightedArrayElement(
      remainingGroups.map((group) => ({ value: group, weight: popularity.get(group.id) ?? 1 }))
    )

    selectedGroups.push(selectedGroup)
    remainingGroups.splice(remainingGroups.indexOf(selectedGroup), 1)
  }

  return selectedGroups
}

// Prisma DATE columns need UTC midnight for the intended calendar date, rather than an Oslo midnight instant.
function toDateOnly(date: TZDate) {
  return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
}

function atHour(date: TZDate, hour: number) {
  return set(date, { hours: hour, minutes: 0, seconds: 0, milliseconds: 0 })
}

export function getCommitteeApplicationFixtures(
  users: readonly Pick<User, "id" | "gender">[],
  currentTime = new Date()
) {
  const applicationsOpenAt = startOfWeek(new TZDate(currentTime, TIME_ZONE), { weekStartsOn: 1 })
  const applicationsCloseAt = atHour(addDays(applicationsOpenAt, 6), 22)
  const firstInterviewDay = addDays(applicationsOpenAt, 7)

  const groupConfigurations = [
    ...exclusiveGroupSlugs.map((groupId) => ({ groupId, type: CommitteeApplicationGroupType.EXCLUSIVE })),
    ...additiveGroupSlugs.map((groupId) => ({ groupId, type: CommitteeApplicationGroupType.ADDITIVE })),
  ]

  const durations = faker.helpers.shuffle([
    ...Array.from({ length: 6 }, () => CommitteeApplicationInterviewDuration.MINUTES_20),
    ...Array.from({ length: 6 }, () => CommitteeApplicationInterviewDuration.MINUTES_30),
  ])

  const groups: ApplicationGroupFixture[] = groupConfigurations.map((configuration, groupIndex) => ({
    id: faker.string.uuid(),
    ...configuration,
    applicationPeriodId: COMMITTEE_APPLICATION_PERIOD_FIXTURE_ID,
    interviewDuration: durations[groupIndex],
  }))

  // Different popularity weights produce quieter and busier committees without forcing every group to have applicants.
  const popularity = new Map(groups.map((group) => [group.id, faker.number.int({ min: 1, max: 10 })]))
  const applicantCount = faker.number.int({ min: 0, max: users.length })
  const applicants = faker.helpers.arrayElements(users, applicantCount)

  const applications: (Prisma.CommitteeApplicationCreateManyInput & { id: string })[] = []
  const groupSelections: GroupSelectionFixture[] = []

  for (const applicant of applicants) {
    const eligibleAdditiveGroups = groups.filter(
      (group) =>
        group.type === CommitteeApplicationGroupType.ADDITIVE &&
        (group.groupId !== "feminit" || applicant.gender === Gender.FEMALE)
    )

    const exclusiveCount = faker.number.int({ min: 0, max: 3 })

    let minimumAdditiveCount = 0

    if (exclusiveCount === 0) {
      minimumAdditiveCount = 1
    }

    const additiveCount = faker.number.int({ min: minimumAdditiveCount, max: eligibleAdditiveGroups.length })
    const selectedGroups = faker.helpers.shuffle([
      ...selectGroups(
        groups.filter((group) => group.type === CommitteeApplicationGroupType.EXCLUSIVE),
        exclusiveCount,
        popularity
      ),
      ...selectGroups(eligibleAdditiveGroups, additiveCount, popularity),
    ])

    const applicationId = faker.string.uuid()

    const createdAt = faker.date.between({
      from: new Date(applicationsOpenAt),
      to: new Date(Math.min(currentTime.getTime(), applicationsCloseAt.getTime())),
    })

    applications.push({
      id: applicationId,
      createdAt,
      updatedAt: createdAt,
      aboutMe: faker.lorem.paragraphs(faker.number.int({ min: 1, max: 3 })),
      userId: applicant.id,
      applicationPeriodId: COMMITTEE_APPLICATION_PERIOD_FIXTURE_ID,
    })

    groupSelections.push(
      ...selectedGroups.map((group, groupIndex) => ({
        id: faker.string.uuid(),
        applicationId,
        applicationGroupId: group.id,
        applicationPeriodId: COMMITTEE_APPLICATION_PERIOD_FIXTURE_ID,
        rank: groupIndex + 1,
      }))
    )
  }

  const interviewBlocks: InterviewBlockFixture[] = []
  const interviews: InterviewFixture[] = []
  const applicantInterviews = new Map<string, InterviewFixture[]>()
  let nextInterviewStart = atHour(firstInterviewDay, faker.number.int({ min: 9, max: 10 }))

  // Pack each committee's interviews consecutively. Serial sessions also avoid overlapping applicant interviews.
  for (const group of faker.helpers.shuffle(groups)) {
    const selections = faker.helpers.shuffle(
      groupSelections.filter((selection) => selection.applicationGroupId === group.id)
    )

    let durationMinutes = 20

    if (group.interviewDuration === CommitteeApplicationInterviewDuration.MINUTES_30) {
      durationMinutes = 30
    }

    let interviewBlock: InterviewBlockFixture | null = null

    for (const selection of selections) {
      if (addMinutes(nextInterviewStart, durationMinutes) > atHour(nextInterviewStart, 17)) {
        nextInterviewStart = atHour(addBusinessDays(nextInterviewStart, 1), faker.number.int({ min: 9, max: 10 }))
        interviewBlock = null
      }

      const interviewEnd = addMinutes(nextInterviewStart, durationMinutes)

      if (interviewBlock === null) {
        interviewBlock = {
          id: faker.string.uuid(),
          applicationGroupId: group.id,
          startsAt: new Date(nextInterviewStart),
          endsAt: new Date(interviewEnd),
          locationName: faker.helpers.arrayElement([
            "Realfagbygget A4-132",
            "Realfagbygget A4-136",
            "Realfagbygget A4-137",
          ]),
          locationUrl: null,
        }

        interviewBlocks.push(interviewBlock)
      }

      const interview: InterviewFixture = {
        id: faker.string.uuid(),
        groupSelectionId: selection.id,
        applicationGroupId: group.id,
        interviewBlockId: interviewBlock.id,
        startsAt: new Date(nextInterviewStart),
        endsAt: new Date(interviewEnd),
      }

      interviews.push(interview)
      interviewBlock.endsAt = new Date(interviewEnd)

      const bookedInterviews = applicantInterviews.get(selection.applicationId) ?? []

      bookedInterviews.push(interview)
      applicantInterviews.set(selection.applicationId, bookedInterviews)

      nextInterviewStart = interviewEnd
    }

    if (selections.length > 0) {
      nextInterviewStart = addMinutes(nextInterviewStart, faker.number.int({ min: 0, max: 2 }) * 15)
    }
  }

  const interviewDays = Array.from({ length: 5 }, (_, dayIndex) => addBusinessDays(firstInterviewDay, dayIndex))
  let lastInterviewDay = addBusinessDays(firstInterviewDay, 4)

  while (lastInterviewDay < startOfDay(nextInterviewStart)) {
    lastInterviewDay = addBusinessDays(lastInterviewDay, 1)

    interviewDays.push(lastInterviewDay)
  }

  const availabilityBlocks: Prisma.CommitteeApplicationAvailabilityCreateManyInput[] = []

  for (const application of applications) {
    const bookedInterviews = applicantInterviews.get(application.id) ?? []

    for (const interviewDay of interviewDays) {
      const dailyInterviews = bookedInterviews.filter((interview) =>
        isSameDay(interviewDay, new TZDate(interview.startsAt, TIME_ZONE))
      )

      if (dailyInterviews.length === 0 && !faker.datatype.boolean({ probability: 0.4 })) {
        continue
      }

      let earliestHour = 14
      let latestHour = 9

      for (const interview of dailyInterviews) {
        const startsAt = new TZDate(interview.startsAt, TIME_ZONE)
        const endsAt = new TZDate(interview.endsAt, TIME_ZONE)

        earliestHour = Math.min(earliestHour, startsAt.getHours())
        latestHour = Math.max(latestHour, endsAt.getHours() + Math.ceil(endsAt.getMinutes() / 60))
      }

      const startHour = faker.number.int({ min: 9, max: earliestHour })
      const endHour = faker.number.int({ min: Math.max(startHour + 2, latestHour), max: 17 })

      availabilityBlocks.push({
        id: faker.string.uuid(),
        applicationId: application.id,
        startsAt: new Date(atHour(interviewDay, startHour)),
        endsAt: new Date(atHour(interviewDay, endHour)),
      })
    }
  }

  const applicationPeriod = {
    id: COMMITTEE_APPLICATION_PERIOD_FIXTURE_ID,
    name: `Komitéopptak ${format(applicationsOpenAt, "yyyy")}`,
    isDraft: true,
    isEnabled: true,
    applicationsOpenAt: new Date(applicationsOpenAt),
    applicationsCloseAt: new Date(applicationsCloseAt),
    interviewsStartDate: toDateOnly(firstInterviewDay),
    interviewsEndDate: toDateOnly(lastInterviewDay),
    interviewsPublishedAt: new Date(
      faker.date.between({ from: applicationsCloseAt, to: addHours(applicationsCloseAt, 1) })
    ),
  } satisfies Prisma.CommitteeApplicationPeriodCreateManyInput

  return {
    applicationPeriod,
    groups,
    applications,
    groupSelections,
    availabilityBlocks,
    interviewBlocks,
    interviews,
  }
}
