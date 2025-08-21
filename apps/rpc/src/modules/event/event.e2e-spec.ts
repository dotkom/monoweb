import type { EventWrite, GroupWrite } from "@dotkomonline/types"
import { faker } from "@faker-js/faker"
import { describe, expect, it } from "vitest"
import { core, dbClient } from "../../../vitest-integration.setup"
import { EventRelationshipError } from "./event-error"

// biome-ignore lint/suspicious/noExportsInTest: used in another spec
export function getMockGroup(input: Partial<GroupWrite> = {}): GroupWrite {
  return {
    type: "COMMITTEE",
    abbreviation: "Dotkom",
    name: "Drift- og utviklingskomiteen",
    description: faker.lorem.sentences(1),
    about: faker.lorem.paragraphs(3),
    contactUrl: faker.internet.url(),
    email: faker.internet.email(),
    imageUrl: faker.image.url(),
    deactivatedAt: null,
    ...input,
  }
}

// biome-ignore lint/suspicious/noExportsInTest: used in another spec
export function getMockEvent(input: Partial<EventWrite> = {}): EventWrite {
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
  it("should create a new event", async () => {
    const mock = getMockEvent()
    const event = await core.eventService.createEvent(dbClient, mock)
    expect(event.title).toBe(mock.title)
    expect(event.companies).toHaveLength(0)
    expect(event.hostingGroups).toHaveLength(0)
    expect(event.attendanceId).toBeNull()
  })

  it("should update event organizers by diffing organizers", async () => {
    const event = await core.eventService.createEvent(dbClient, getMockEvent())
    const group = await core.groupService.create(dbClient, getMockGroup())
    const updated = await core.eventService.updateEventOrganizers(dbClient, event.id, new Set([group.slug]), new Set())
    expect(updated.hostingGroups).toHaveLength(1)
    // Updating with new ones and removing some
    const group2 = await core.groupService.create(
      dbClient,
      getMockGroup({ abbreviation: "fagkom", name: "Fag- og kurskomiteen" })
    )
    const updated2 = await core.eventService.updateEventOrganizers(
      dbClient,
      updated.id,
      new Set([group2.slug]),
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
    const eventObject = await core.eventService.createEvent(dbClient, getMockEvent())
    const group = await core.groupService.create(dbClient, getMockGroup())
    const event = await core.eventService.updateEventOrganizers(
      dbClient,
      eventObject.id,
      new Set([group.slug]),
      new Set()
    )
    // It finds events by a search term
    {
      const events = await core.eventService.findEvents(dbClient, {
        bySearchTerm: event.title.substring(0, 5),
        byId: [],
        byStartDate: { min: null, max: null },
        byOrganizingCompany: [],
        byOrganizingGroup: [],
      })
      expect(events).toHaveLength(1)
    }
    // It finds events by an organizing group
    {
      const events = await core.eventService.findEvents(dbClient, {
        bySearchTerm: null,
        byId: [],
        byStartDate: { min: null, max: null },
        byOrganizingCompany: [],
        byOrganizingGroup: [group.slug],
      })
      expect(events).toHaveLength(1)
    }
    // It finds events by a specific id
    {
      const events = await core.eventService.findEvents(dbClient, {
        bySearchTerm: null,
        byId: [event.id],
        byStartDate: { min: null, max: null },
        byOrganizingCompany: [],
        byOrganizingGroup: [],
      })
      expect(events).toHaveLength(1)
    }
  })

  it("should prevent assigning itself as a parent event", async () => {
    const event = await core.eventService.createEvent(dbClient, getMockEvent())
    await expect(core.eventService.updateEventParent(dbClient, event.id, event.id)).rejects.toThrow(
      EventRelationshipError
    )
  })

  it("should prevent cyclic event relationships", async () => {
    const event1 = await core.eventService.createEvent(dbClient, getMockEvent())
    const event2 = await core.eventService.createEvent(dbClient, getMockEvent())

    // It is legal to set event1 as a parent of event2
    await expect(core.eventService.updateEventParent(dbClient, event2.id, event1.id)).resolves.toBeDefined()

    // But it should now be illegal to set event2 as a parent of event1
    await expect(core.eventService.updateEventParent(dbClient, event1.id, event2.id)).rejects.toThrow(
      EventRelationshipError
    )
  })

  it("should ban nesting more than one level deep", async () => {
    const event1 = await core.eventService.createEvent(dbClient, getMockEvent())
    const event2 = await core.eventService.createEvent(dbClient, getMockEvent())
    const event3 = await core.eventService.createEvent(dbClient, getMockEvent())

    // It is legal to set event1 as a parent of event2
    await expect(core.eventService.updateEventParent(dbClient, event2.id, event1.id)).resolves.toBeDefined()

    // It is not legal to set event2 as a parent of event3, as event2 already has a parent
    await expect(core.eventService.updateEventParent(dbClient, event3.id, event2.id)).rejects.toThrowError(
      EventRelationshipError
    )
  })
})
