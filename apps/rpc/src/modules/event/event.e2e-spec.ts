import type { EventWrite, GroupWrite } from "@dotkomonline/types"
import { faker } from "@faker-js/faker"
import type { ManagementClient } from "auth0"
import { describe, expect, it } from "vitest"
import { mockDeep } from "vitest-mock-extended"
import { dbClient } from "../../../vitest-integration.setup"
import { getFeideGroupsRepository } from "../feide/feide-groups-repository"
import { getGroupRepository } from "../group/group-repository"
import { getGroupService } from "../group/group-service"
import { getNTNUStudyplanRepository } from "../ntnu-study-plan/ntnu-study-plan-repository"
import { getNotificationPermissionsRepository } from "../user/notification-permissions-repository"
import { getPrivacyPermissionsRepository } from "../user/privacy-permissions-repository"
import { getUserRepository } from "../user/user-repository"
import { getUserService } from "../user/user-service"
import { getEventRepository } from "./event-repository"
import { getEventService } from "./event-service"

function getMockGroup(input: Partial<GroupWrite> = {}): GroupWrite {
  return {
    type: "COMMITTEE",
    abbreviation: "Dotkom",
    name: "Drift- og utviklingskomiteen",
    description: faker.lorem.sentences(1),
    about: faker.lorem.paragraphs(3),
    contactUrl: faker.internet.url(),
    email: faker.internet.email(),
    imageUrl: faker.image.url(),
    ...input,
  }
}

function getMockEvent(input: Partial<EventWrite> = {}): EventWrite {
  return {
    status: "PUBLIC",
    type: "SOCIAL",
    title: faker.lorem.sentence(1),
    start: faker.date.future(),
    end: faker.date.future(),
    description: faker.lorem.paragraphs(3),
    subtitle: faker.lorem.lines(1),
    imageUrl: faker.image.url(),
    locationTitle: faker.location.city(),
    locationLink: null,
    locationAddress: faker.location.streetAddress(),
    ...input,
  }
}

describe("event integration tests", () => {
  const managementClient = mockDeep<ManagementClient>()
  const userRepository = getUserRepository(managementClient)
  const notificationPermissionsRepository = getNotificationPermissionsRepository()
  const privacyPermissionsRepository = getPrivacyPermissionsRepository()
  const feideGroupsRepository = getFeideGroupsRepository()
  const ntnuStudyPlanRepository = getNTNUStudyplanRepository()
  const userService = getUserService(
    userRepository,
    privacyPermissionsRepository,
    notificationPermissionsRepository,
    feideGroupsRepository,
    ntnuStudyPlanRepository
  )
  const groupRepository = getGroupRepository()
  const groupService = getGroupService(groupRepository, userService)
  const eventRepository = getEventRepository()
  const eventService = getEventService(eventRepository)

  it("should create a new event", async () => {
    const mock = getMockEvent()
    const event = await eventService.createEvent(dbClient, mock)
    expect(event.title).toBe(mock.title)
    expect(event.companies).toHaveLength(0)
    expect(event.interestGroups).toHaveLength(0)
    expect(event.hostingGroups).toHaveLength(0)
    expect(event.attendanceId).toBeNull()
  })

  it("should update event organizers by diffing organizers", async () => {
    const event = await eventService.createEvent(dbClient, getMockEvent())
    const group = await groupService.create(dbClient, getMockGroup())
    const updated = await eventService.updateEventOrganizers(
      dbClient,
      event.id,
      new Set([group.slug]),
      new Set(),
      new Set()
    )
    expect(updated.hostingGroups).toHaveLength(1)
    // Updating with new ones and removing some
    const group2 = await groupService.create(
      dbClient,
      getMockGroup({ abbreviation: "fagkom", name: "Fag- og kurskomiteen" })
    )
    const updated2 = await eventService.updateEventOrganizers(
      dbClient,
      updated.id,
      new Set([group2.slug]),
      new Set(),
      new Set()
    )
    expect(updated2.hostingGroups).toHaveLength(1)
    expect(updated2.hostingGroups).not.toContainEqual(
      expect.objectContaining({
        slug: group.slug,
      })
    )
  })

  it("should find events by various filter criteria", async () => {
    const eventObject = await eventService.createEvent(dbClient, getMockEvent())
    const group = await groupService.create(dbClient, getMockGroup())
    const event = await eventService.updateEventOrganizers(
      dbClient,
      eventObject.id,
      new Set([group.slug]),
      new Set(),
      new Set()
    )
    // It finds events by a search term
    {
      const events = await eventService.findEvents(dbClient, {
        bySearchTerm: event.title.substring(0, 5),
        byId: [],
        byStartDate: { min: null, max: null },
        byOrganizingCompany: [],
        byOrganizingGroup: [],
        byOrganizingInterestGroup: [],
      })
      expect(events).toHaveLength(1)
    }
    // It finds events by an organizing group
    {
      const events = await eventService.findEvents(dbClient, {
        bySearchTerm: null,
        byId: [],
        byStartDate: { min: null, max: null },
        byOrganizingCompany: [],
        byOrganizingGroup: [group.slug],
        byOrganizingInterestGroup: [],
      })
      expect(events).toHaveLength(1)
    }
    // It finds events by a specific id
    {
      const events = await eventService.findEvents(dbClient, {
        bySearchTerm: null,
        byId: [event.id],
        byStartDate: { min: null, max: null },
        byOrganizingCompany: [],
        byOrganizingGroup: [],
        byOrganizingInterestGroup: [],
      })
      expect(events).toHaveLength(1)
    }
  })
})
