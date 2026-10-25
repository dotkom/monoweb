import type { Prisma } from "../"
import { groupSlug } from "./group"
import { eventId } from "./event"

export const getEventHostingGroupFixtures = (): Prisma.EventHostingGroupCreateManyInput[] => [
  {
    eventId: eventId("fixturesCourse"),
    groupId: groupSlug("fagkom"),
  },
  {
    eventId: eventId("fixturesCourse"),
    groupId: groupSlug("dotkom"),
  },
  {
    eventId: eventId("are2025"),
    groupId: groupSlug("arrkom"),
  },
  {
    eventId: eventId("sommerfest2025"),
    groupId: groupSlug("backlog"),
  },
  {
    eventId: eventId("sommerfest2025"),
    groupId: groupSlug("hs"),
  },
  {
    eventId: eventId("vinkurs"),
    groupId: groupSlug("fagkom"),
  },
  {
    eventId: eventId("areExcursionInfoMeeting"),
    groupId: groupSlug("ekskom"),
  },
  {
    eventId: eventId("firstYearExamParty"),
    groupId: groupSlug("arrkom"),
  },
  {
    eventId: eventId("fifthYearGraduation"),
    groupId: groupSlug("hs"),
  },
  {
    eventId: eventId("footballShirtFriday"),
    groupId: groupSlug("trikom"),
  },
  {
    eventId: eventId("discreteMathExamCourse"),
    groupId: groupSlug("fagkom"),
  },
  {
    eventId: eventId("volleyball"),
    groupId: groupSlug("oil"),
  },
  {
    eventId: eventId("firstYearExamReading"),
    groupId: groupSlug("trikom"),
  },
  {
    eventId: eventId("may17Breakfast"),
    groupId: groupSlug("arrkom"),
  },
]
