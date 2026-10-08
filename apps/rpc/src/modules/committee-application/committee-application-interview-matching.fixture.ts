import { tz } from "@date-fns/tz"
import { Faker, en, nb_NO } from "@faker-js/faker"
import { addDays, addHours, parseISO } from "date-fns"
import type { CommitteeApplicationInterviewMatchingInput } from "./committee-application"

export interface InterviewMatchingFixture {
  input: CommitteeApplicationInterviewMatchingInput
  applicants: { id: string; name: string; isFemale: boolean }[]
  weekStartsAt: Date
}

const exclusiveCommittees = [
  "appkom",
  "arrkom",
  "bedkom",
  "dotkom",
  "fagkom",
  "online-il",
  "prokom",
  "redaksjonen",
  "trikom",
]
const additiveCommittees = ["backlog", "dotdagene", "feminit"]
const dateContext = { in: tz("Europe/Oslo") }

// A local seeded Faker instance keeps this data repeatable without changing other tests' random state.
export function createInterviewMatchingFixture(): InterviewMatchingFixture {
  const faker = new Faker({ locale: [nb_NO, en] })
  faker.seed(20261012)
  const weekStartsAt = parseISO("2026-10-12T00:00:00+02:00")
  const input: CommitteeApplicationInterviewMatchingInput = {
    interviewsPublishedAt: parseISO("2026-10-11T23:00:00+02:00"),
    applications: [],
    groups: [],
    groupSelections: [],
    availabilityBlocks: [],
    interviewBlocks: [],
  }

  for (const [groupIndex, groupId] of [...exclusiveCommittees, ...additiveCommittees].entries()) {
    const interviewDuration = groupIndex % 2 === 0 ? "MINUTES_20" : "MINUTES_30"
    input.groups.push({ id: groupId, interviewDuration })
    const interviewDays = faker.helpers.arrayElements([0, 1, 2, 3, 4], 3).toSorted()
    const rooms = ["Rom A"]

    if (groupId === "dotkom" || groupId === "arrkom") {
      rooms.push("Rom B")
    }

    for (const dayIndex of interviewDays) {
      const day = addDays(weekStartsAt, dayIndex, dateContext)
      const startHour = faker.helpers.arrayElement([9, 10, 12, 13])
      const startsAt = addHours(day, startHour)

      for (const room of rooms) {
        input.interviewBlocks.push({
          id: `${groupId}:${dayIndex}:${room}`,
          applicationGroupId: groupId,
          locationName: room,
          startsAt,
          endsAt: addHours(startsAt, 4),
        })
      }
    }
  }

  const applicants = Array.from({ length: 100 }, (_, applicantIndex) => {
    const id = `applicant-${String(applicantIndex + 1).padStart(3, "0")}`
    const isFemale = applicantIndex % 2 === 0
    const name = `${faker.person.firstName(isFemale ? "female" : "male")} ${faker.person.lastName()}`
    input.applications.push({ id })
    const eligibleAdditiveCommittees = additiveCommittees.filter((groupId) => groupId !== "feminit" || isFemale)
    const selectedGroups = [
      ...faker.helpers.arrayElements(exclusiveCommittees, faker.number.int({ min: 1, max: 3 })),
      ...faker.helpers.arrayElements(eligibleAdditiveCommittees, faker.number.int({ min: 0, max: 2 })),
    ]

    for (const groupId of selectedGroups) {
      input.groupSelections.push({ id: `${id}:${groupId}`, applicationId: id, applicationGroupId: groupId })
    }

    const availableDays = faker.helpers.arrayElements([0, 1, 2, 3, 4], faker.number.int({ min: 2, max: 4 }))

    for (const dayIndex of availableDays) {
      const day = addDays(weekStartsAt, dayIndex, dateContext)
      const startHour = faker.number.int({ min: 9, max: 12 })
      input.availabilityBlocks.push({
        applicationId: id,
        startsAt: addHours(day, startHour),
        endsAt: addHours(day, Math.min(17, startHour + faker.number.int({ min: 3, max: 6 }))),
      })
    }

    return { id, name, isFemale }
  })

  return { input, applicants, weekStartsAt }
}
