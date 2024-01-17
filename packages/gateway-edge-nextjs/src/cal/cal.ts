import { type NextApiRequest, type NextApiResponse } from "next"
import ical, { type ICalEventData } from "ical-generator"
import { type Event } from "@dotkomonline/types"
import { createServerSideHelpers } from "@trpc/react-query/server"
import { appRouter, createContextInner, transformer } from "@dotkomonline/gateway-trpc"

const helpers = createServerSideHelpers({
  router: appRouter,
  ctx: await createContextInner({
    auth: null,
  }),
  transformer, // optional - adds superjson serialization
})

function eventUrl(event: Pick<Event, "id">) {
  // a better to to get/configure the url?
  return `https://dev.web.online.ntnu.no/events/${event.id}`
}

// ALL events
export async function CalendarAll(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.status(405).end()
    return
  }

  const instance = ical({ name: `Online Linjeforening Arrangementer` })

  const events = await helpers.event.all.fetch()
  events.forEach((event) => {
    instance.createEvent(toICal(event))
  })

  res.status(200).send(instance.toString())
}

// a single event
export async function CalendarEvent(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.status(405).end()
    return
  }

  const eventid = req.query.eventid as string
  if (!eventid) {
    res.status(400).json({ message: "Missing eventid" })
    return
  }

  const event = (await helpers.event.get.fetch(eventid)).event

  const instance = ical()
  instance.createEvent(toICal(event))

  res.status(200).send(instance.toString())
}

// all events a user is attending
export async function CalendarUser(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.status(405).end()
    return
  }

  const userid = req.query.user as string
  if (!userid) {
    res.status(400).json({ message: "Missing user" })
    return
  }

  // TODO figure out some auth here?
  // const user = await helpers.user.all.fetch()
  // console.log(user)

  const events = await helpers.event.allByUserId.fetch({ id: userid })
  const instance = ical({ name: `${userid} online kalender` })

  events.forEach((event) => {
    instance.createEvent(toICal(event))
    instance.createEvent(toICal(toRegistration(event)))
  })

  res.status(200).send(instance.toString())
}

function toICal(event: Pick<Event, "start" | "end" | "title" | "description" | "location" | "id">): ICalEventData {
  return {
    start: event.start,
    end: event.end,
    summary: event.title,
    description: event.description,
    location: event.location,
    url: eventUrl(event),
  }
}

function toRegistration(
  event: Pick<Event, "start" | "title" | "description" | "id">
): Pick<Event, "start" | "end" | "title" | "description" | "location" | "id"> {
  // 5 days before
  // TODO when db has this, we can use the actual start value, this is just for testing
  const start = new Date(event.start.getTime() - 5 * 24 * 60 * 60 * 1000)

  const title = `Påmelding for ${event.title}`
  const location = "På OW"

  return {
    start,
    end: start, // 0 length
    title,
    description: event.description,
    location,
    id: event.id,
  }
}
