// import { appRouter, createContext, transformer } from "@dotkomonline/gateway-trpc"
// import type { Event } from "@dotkomonline/types"
// import { createServerSideHelpers } from "@trpc/react-query/server"
// import ical, { type ICalEventData } from "ical-generator"
// import jwt from "jsonwebtoken"
// import type { NextApiRequest, NextApiResponse } from "next"
// import { getServerSession } from "next-auth"
// import { authOptions } from "../../../auth/src/web.app"
//
// const helpers = createServerSideHelpers({
//   router: appRouter,
//   ctx: await createContext({
//     principal: null,
//   }),
//   transformer, // optional - adds superjson serialization
// })
//
// function eventUrl(req: NextApiRequest, event: Pick<Event, "id">) {
//   const proto = req.headers["x-forwarded-proto"] || "http"
//   const host = req.headers["x-forwarded-host"] || "online.ntnu.no"
//
//   // a better to to get/configure the url?
//   return `${proto}://${host}/events/${event.id}`
// }
//
// // ALL events
// export async function CalendarAll(req: NextApiRequest, res: NextApiResponse) {
//   if (req.method !== "GET") {
//     res.status(405).end()
//     return
//   }
//
//   const instance = ical({ name: "Online Linjeforening Arrangementer" })
//
//   const events = await helpers.event.all.fetch()
//
//   for (const event of events) {
//     instance.createEvent(toICal(req, event))
//   }
//
//   res.status(200).send(instance.toString())
// }
//
// // a single event
// export async function CalendarEvent(req: NextApiRequest, res: NextApiResponse) {
//   if (req.method !== "GET") {
//     res.status(405).end()
//     return
//   }
//
//   const eventid = req.query.eventid as string
//   if (!eventid) {
//     res.status(400).json({ message: "Missing eventid" })
//     return
//   }
//
//   const event = await helpers.event.get.fetch(eventid)
//
//   const instance = ical()
//   instance.createEvent(toICal(req, event))
//
//   res.status(200).send(instance.toString())
// }
//
// // all events a user is attending
// export async function CalendarUser(req: NextApiRequest, res: NextApiResponse) {
//   if (req.method !== "GET") {
//     res.status(405).end()
//     return
//   }
//
//   const token = req.query.user as string
//   if (!token) {
//     res.status(400).json({ message: "Missing token" })
//     return
//   }
//
//   const cal_key = process.env.CAL_KEY
//   if (!cal_key) {
//     res.status(500).json({ message: "Missing key" })
//   }
//
//   let userid = ""
//   try {
//     userid = jwt.verify(token, cal_key as string) as string
//   } catch {
//     res.status(400).json({ message: "bad key" })
//   }
//
//   const events = await helpers.event.allByUserId.fetch({ id: userid })
//   const instance = ical({ name: `${userid} online kalender` })
//
//   for (const event of events) {
//     instance.createEvent(toICal(req, event))
//     instance.createEvent(toICal(req, toRegistration(event)))
//   }
//
//   res.status(200).send(instance.toString())
// }
//
// // make a token for the signed in user
// export async function CalendarSign(req: NextApiRequest, res: NextApiResponse) {
//   if (req.method !== "GET") {
//     res.status(405).end()
//     return
//   }
//
//   const session = await getServerSession(req, res, authOptions)
//   const authed_id = session?.user.id
//   if (!authed_id) {
//     res.status(400).json({ message: "Not signed in" })
//   }
//
//   const cal_key = process.env.CAL_KEY
//   if (!cal_key) {
//     res.status(500).json({ message: "Missing key" })
//   }
//
//   const token = jwt.sign(authed_id as string, cal_key as string, {})
//
//   res.status(200).json({ token })
// }
//
// function toICal(
//   req: NextApiRequest,
//   event: Pick<Event, "description" | "end" | "id" | "locationAddress" | "start" | "title">
// ): ICalEventData {
//   return {
//     start: event.start,
//     end: event.end,
//     summary: event.title,
//     description: event.description,
//     location: event.locationAddress,
//     url: eventUrl(req, event),
//   }
// }
//
// function toRegistration(
//   event: Pick<Event, "description" | "id" | "start" | "title">
// ): Pick<Event, "description" | "end" | "id" | "locationAddress" | "start" | "title"> {
//   // 5 days before
//   // TODO when db has this, we can use the actual start value, this is just for testing
//   const start = new Date(event.start.getTime() - 5 * 24 * 60 * 60 * 1000)
//
//   const title = `Påmelding for ${event.title}`
//   const location = "På OW"
//
//   return {
//     start,
//     end: start, // 0 length
//     title,
//     description: event.description,
//     locationAddress: location,
//     id: event.id,
//   }
// }
