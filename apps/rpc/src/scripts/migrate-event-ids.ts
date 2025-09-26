import fsp from "node:fs/promises"
import path from "node:path"
import { marked } from "marked"
import { configuration } from "../configuration"
import { createServiceLayer, createThirdPartyClients } from "../modules/core"
import { EventSchema } from "./migrate-events-schemas"

const dependencies = createThirdPartyClients(configuration)
const serviceLayer = await createServiceLayer(dependencies, configuration)
const prisma = serviceLayer.prisma

const pathOfThisScript = import.meta.dirname
const rawEvents = JSON.parse(await fsp.readFile(path.resolve(pathOfThisScript, "./ow4_events.json"), "utf-8"))

const ow4Events = EventSchema.array().parse(rawEvents)

// Convert ow4 event descriptions to html as they were imported as html
for (const event of ow4Events) {
  event.description = marked(event.description, {
    async: false,
  })
}

const dbEvents = await prisma.event.findMany({
  where: {
    metadataImportId: {
      equals: 420,
    },
  },
})

const dbEventIdsWithNoMatches: string[] = []
const dbEventIdsWithMultipleMatches: string[] = []

for (const dbEvent of dbEvents) {
  const matches = ow4Events.filter(
    (ow4Event) =>
      ow4Event.title === dbEvent.title &&
      new Date(ow4Event.event_start).getTime() === dbEvent.start.getTime() &&
      new Date(ow4Event.event_end).getTime() === dbEvent.end.getTime() &&
      ow4Event.description === dbEvent.description
  )

  if (matches.length === 0) {
    console.log("No match for event", dbEvent)
    dbEventIdsWithNoMatches.push(dbEvent.id)
    continue
  }

  if (matches.length > 1) {
    console.log("Multiple matches for event", dbEvent, "Matches:", matches)
    dbEventIdsWithMultipleMatches.push(dbEvent.id)
    continue
  }

  await prisma.event.update({
    where: {
      id: dbEvent.id,
    },
    data: {
      metadataImportId: matches[0].id,
    },
  })
}

console.log("Events with no matches:", dbEventIdsWithNoMatches.length, dbEventIdsWithNoMatches)
console.log("Events with multiple matches:", dbEventIdsWithMultipleMatches.length, dbEventIdsWithMultipleMatches)
