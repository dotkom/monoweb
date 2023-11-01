import { NextApiRequest, NextApiResponse } from "next"
import ical from "ical-generator";
import { createServerSideHelpers } from "@trpc/react-query/server"
import { appRouter, createContextInner, transformer } from "@dotkomonline/gateway-trpc"

const helpers = createServerSideHelpers({
  router: appRouter,
  ctx: await createContextInner({
    auth: null,
  }),
  transformer, // optional - adds superjson serialization
})

function eventUrl(event: { id: string }) {
  // a better to to get/configure the url?
  return `https://new.online.ntnu.no/events/${event.id}`;
}

// ALL events
export async function CalendarAll(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.status(405).end()
    return
  }

  const events = await helpers.event.all.fetch()
  const instance = ical({ name: `Online Linjeforening Arrangementer` });

  events.forEach(event => {
    instance.createEvent({
      start: event.start,
      end: event.end,
      summary: event.title,
      description: event.description,
      location: event.location,
      url: eventUrl(event)
    });
  });


  res.status(200).send(instance.toString())
  return;
}

// a single event
export async function CalendarEvent(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.status(405).end()
    return
  }

  const eventid = req.query.eventid as string;
  if (!eventid) {
    res.status(400).json({ message: "Missing eventid" })
    return
  }

  const event = (await helpers.event.get.fetch(eventid)).event;

  const instance = ical();

  instance.createEvent({
    start: event.start,
    end: event.end,
    summary: event.title,
    description: event.description,
    location: event.location,
    url: eventUrl(event)
  });

  res.status(200).send(instance.toString())

  return;
}


// all events a user is attending
export async function CalendarUser(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.status(405).end()
    return
  }

  const userid = req.query.user as string;
  if (!userid) {
    res.status(400).json({ message: "Missing user" })
    return
  }


  // TODO figure out some auth here?
  // const user = await helpers.user.all.fetch()
  // console.log(user)

  const events = await helpers.event.allByUserId.fetch({ 'id': userid })
  const instance = ical({ name: `${userid} online kalender` });

  events.forEach(event => {
    instance.createEvent({
      start: event.start,
      end: event.end,
      summary: event.title,
      description: event.description,
      location: event.location,
      url: eventUrl(event)
    });
  });

  res.status(200).send(instance.toString())

  return;
}
