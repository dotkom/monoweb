import { NextApiRequest, NextApiResponse } from "next"
import ical from "ical-generator";
import { createServerSideHelpers } from "@trpc/react-query/server"
import { appRouter, createContextInner, transformer } from "@dotkomonline/gateway-trpc"

export async function CalUserHandler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.status(405).end()
    return
  }

  const user = req.query.user as string;
  if (!user) {
    res.status(400).json({ message: "Missing user" })
    return
  }

  const helpers = createServerSideHelpers({
    router: appRouter,
    ctx: await createContextInner({
      auth: null,
    }),
    transformer, // optional - adds superjson serialization
  })

  const events = await helpers.event.all.fetch()
  const instance = ical({name: `${user} online kalender`});

  events.forEach(event => {
    instance.createEvent({
      start: event.start,
      end: event.end,
      summary: event.title,
      description: event.description,
      location: event.location,
      url: 'http://online.ntnu.no'
    });
  });


  res.status(200).send(instance.toString())
  return;
}
