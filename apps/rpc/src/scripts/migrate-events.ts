import { default as fs } from "node:fs/promises"
import path from "node:path"
import type { EventType, Prisma } from "@prisma/client"
import { Command } from "commander"
import { marked } from "marked"
import { createServiceLayer, createThirdPartyClients } from "src/modules/core"
import z from "zod"
import { configuration } from "../configuration"
import {
  AttendanceEventSchema,
  type EventAttendee,
  EventAttendeeSchema,
  EventSchema,
  type GradeRule,
  GradeRuleSchema,
  type RuleBundle,
  RuleBundleSchema,
} from "./migrate-events-schemas"
import { dumpOW4Data } from "./migrate-from-ow4"

async function getRuleBundles() {
  const ruleBundles = new Map<number, RuleBundle>()
  const ruleBundleData = await dumpOW4Data("https://old.online.ntnu.no/api/v1/event/rule-bundles/?")
  const data = z.array(RuleBundleSchema).parse(ruleBundleData)

  for (const bundle of data) {
    ruleBundles.set(bundle.id, bundle)
  }

  return ruleBundles
}

async function getGradeRules() {
  const gradeRules = new Map<number, GradeRule>()
  const rawData = await dumpOW4Data("https://old.online.ntnu.no/api/v1/event/grade-rules/?")
  const data = z.array(GradeRuleSchema).parse(rawData)

  for (const bundle of data) {
    gradeRules.set(bundle.id, bundle)
  }

  return gradeRules
}

/*
  ow4_events.json is from this sql query:
  SELECT
  json_agg(t)
  FROM
    (
      SELECT
        events_event.id,
        title,
        events_event.description,
        to_char(event_start, 'YYYY-MM-DD"T"HH24:MI:SS"Z"') AS event_start,
        to_char(event_end, 'YYYY-MM-DD"T"HH24:MI:SS"Z"') AS event_end,
        location,
        event_type,
        organizer_id,
        gallery_responsiveimage.image_original,
        EXISTS (
          SELECT
            1
          FROM
            events_attendanceevent ea
          WHERE
            ea.event_id = events_event.id
        ) AS is_attendance_event
      FROM
        events_event
        LEFT JOIN gallery_responsiveimage ON gallery_responsiveimage.id = events_event.image_id
    ) t;
*/
async function getEvents() {
  const fpath = path.resolve(import.meta.dirname, "ow4_events.json")
  const rawData = JSON.parse((await fs.readFile(fpath)).toString())
  return EventSchema.array().parse(rawData)
}

async function getEventAttendees() {
  /* event_attendees.json is from this sql query:
    SELECT
      events_attendee.*,
      auth0_subject
    FROM
      events_attendee
      LEFT JOIN authentication_onlineuser ON events_attendee.user_id = authentication_onlineuser.id
    ORDER BY event_id, timestamp ASC;
  */
  const fpath = path.resolve(import.meta.dirname, "event_attendees.json")
  const rawData = JSON.parse((await fs.readFile(fpath)).toString())
  const eventUsers = z.array(EventAttendeeSchema).parse(rawData)
  const usersByEvent = new Map<number, EventAttendee[]>()
  for (const eventUser of eventUsers) {
    if (!eventUser.auth0_subject) {
      continue
    }
    let usersInEvent = usersByEvent.get(eventUser.event_id)
    if (!usersInEvent) {
      usersInEvent = []
      usersByEvent.set(eventUser.event_id, usersInEvent)
    }

    usersInEvent.push(eventUser)
  }
  return usersByEvent
}

async function fetchEventAttendance(id: string) {
  const response = await fetch(`https://old.online.ntnu.no/api/v1/event/attendance-events/${id}/`)
  if (!response.ok) {
    throw new Error(response.statusText)
  }
  const attendanceEvent = AttendanceEventSchema.parse(await response.json())
  return attendanceEvent
}

function mapEventType(ow4EventType: number): EventType {
  switch (ow4EventType) {
    case 1:
      return "SOCIAL"
    case 2:
      return "COMPANY"
    case 3:
      return "ACADEMIC"
    case 4:
      return "OTHER"
    case 5:
      return "OTHER"
    case 6:
      return "INTERNAL"
    case 7:
      return "OTHER"
    case 8:
      return "SOCIAL"
    default:
      throw new Error("what?")
  }
}

const program = new Command()
const dependencies = createThirdPartyClients(configuration)
const serviceLayer = await createServiceLayer(dependencies, configuration)
const prisma = serviceLayer.prisma

program.name("migrate-groups").description("CLI tool for migrating events from OW4")

program.description("Import events from ow4").action(async () => {
  const eventAttendees = await getEventAttendees()
  const events = await getEvents()
  const ruleBundles = await getRuleBundles()
  const gradeRules = await getGradeRules()

  const dbEvents = await prisma.event.findMany({
    where: {
      metadataImportId: {
        not: null,
      },
    },
  })

  const existingUsers = new Set((await prisma.user.findMany({ select: { id: true } })).map((user) => user.id))

  for (const event of events) {
    if (dbEvents.some((dbEvent) => dbEvent.metadataImportId === event.id)) {
      console.log("SKIPPING EVENT", event.title)
      continue
    }

    console.log("CREATING EVENT", event.title)
    await prisma.$transaction(async (tsx) => {
      let poolString = null
      let grades = null
      let users = null
      let eventAttendance = null
      if (event.is_attendance_event) {
        eventAttendance = await fetchEventAttendance(event.id.toString())

        const ruleStrings = []
        grades = []
        for (const ruleBundleId of eventAttendance.rule_bundles) {
          const ruleBundle = ruleBundles.get(ruleBundleId)
          if (!ruleBundle) {
            continue
          }
          ruleStrings.push(
            ruleBundle.description?.trim() ??
              ruleBundle.rule_strings
                .filter((a) => a.trim().length > 0)
                .join(", ")
                .trim()
          )
          for (const gradeRuleId of ruleBundle.grade_rules) {
            const gradeRule = gradeRules.get(gradeRuleId)

            if (gradeRule) {
              grades.push(gradeRule.id)
            }
          }
        }

        if (grades.length === 0) {
          for (const ruleBundleId of eventAttendance.rule_bundles) {
            const ruleBundle = ruleBundles.get(ruleBundleId)

            if (!ruleBundle) {
              continue
            }

            if (ruleBundle.field_of_study_rules?.includes(1)) {
              grades.push(1)
              grades.push(2)
              grades.push(3)
            }

            if (ruleBundle.field_of_study_rules.some((rule) => 10 <= rule && rule <= 30)) {
              grades.push(1)
              grades.push(2)
            }
          }
        }

        poolString = ruleStrings.filter((a) => a.trim().length > 0).join(", ")

        users = eventAttendees.get(event.id) ?? []
      }

      const createdEvent = await tsx.event.create({
        data: {
          description: await marked(event.description),
          start: event.event_start,
          end: event.event_end,
          status: "PUBLIC",
          type: mapEventType(event.event_type),
          title: event.title,
          imageUrl: event.image_original,
          locationTitle: event.location,
          attendance:
            eventAttendance && poolString && grades && users
              ? {
                  create: {
                    registerStart: eventAttendance.registration_start,
                    registerEnd: eventAttendance.registration_end,
                    deregisterDeadline: eventAttendance.unattend_deadline,
                    pools: {
                      create: {
                        capacity: eventAttendance.max_capacity,
                        title: poolString,
                        yearCriteria: grades.filter((grade) => grade >= 1 && grade <= 5),
                      },
                    },
                  },
                }
              : undefined,
          metadataImportId: event.id,
        },
      })

      const attendanceId = createdEvent.attendanceId
      if (attendanceId && users && eventAttendance) {
        const pool = await tsx.attendancePool.findFirstOrThrow({ where: { attendanceId } })
        await tsx.attendee.createMany({
          data: users
            .map((user, i) => ({
              attendanceId: attendanceId,
              userId: user.auth0_subject,
              attendancePoolId: pool.id,
              reserved: i < eventAttendance.max_capacity,
              earliestReservationAt: user.timestamp,
              visible: user.show_as_attending_event,
            }))
            .filter(({ visible, userId }) => visible && userId && existingUsers.has(userId))
            .map(
              ({ visible, userId, ...data }) =>
                ({ ...data, userId: userId as string }) satisfies Prisma.AttendeeCreateManyInput
            ),
        })
      }
    })
  }
})

program.parse()
