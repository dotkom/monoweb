import fs from "node:fs/promises"
import path from "node:path"
import type { EventType, Prisma } from "@prisma/client"
import { Command } from "commander"
import { marked } from "marked"
import { createServiceLayer, createThirdPartyClients } from "src/modules/core"
import z from "zod"
import { createConfiguration } from "../configuration"
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

/*

SELECT
  COALESCE(
    json_agg(t ORDER BY t.id),
    '[]'::json
  )
FROM (
  SELECT
    e.*,
    COALESCE(
      (
        SELECT JSONB_AGG(gr.graderule_id ORDER BY gr.graderule_id)
               FILTER (WHERE gr.graderule_id IS NOT NULL)
        FROM events_rulebundle_grade_rules gr
        WHERE gr.rulebundle_id = e.id
      ),
      '[]'::jsonb
    ) AS grade_rules,
    COALESCE(
      (
        SELECT JSONB_AGG(fsr.fieldofstudyrule_id ORDER BY fsr.fieldofstudyrule_id)
               FILTER (WHERE fsr.fieldofstudyrule_id IS NOT NULL)
        FROM events_rulebundle_field_of_study_rules fsr
        WHERE fsr.rulebundle_id = e.id
      ),
      '[]'::jsonb
    ) AS field_of_study_rules
  FROM events_rulebundle e
) AS t;
*/
async function getRuleBundles() {
  const ruleBundles = new Map<number, RuleBundle>()
  const fpath = path.resolve(import.meta.dirname, "event_rulebundles.json")
  const ruleBundleData = JSON.parse((await fs.readFile(fpath)).toString())
  const data = z.array(RuleBundleSchema).parse(ruleBundleData)

  for (const bundle of data) {
    ruleBundles.set(bundle.id, bundle)
  }

  return ruleBundles
}

/*
  SELECT
  COALESCE(
    json_agg(t ORDER BY t.id),
    '[]'::json
  )
FROM (
  SELECT
    rule_ptr_id AS id,
    grade
  FROM events_graderule
) AS t;
*/
async function getGradeRules() {
  const gradeRules = new Map<number, GradeRule>()
  const fpath = path.resolve(import.meta.dirname, "event_graderules.json")
  const rawData = JSON.parse((await fs.readFile(fpath)).toString())

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

/*
SELECT
  COALESCE(
    json_agg(t ORDER BY t.event_id),
    '[]'::json
  )
FROM (
  SELECT 
      e.event_id,
      e.max_capacity,
      e.registration_end,
      e.registration_start,
      e.unattend_deadline,
      COALESCE(
          JSONB_AGG(r.rulebundle_id) FILTER (WHERE r.rulebundle_id IS NOT NULL),
          '[]'::jsonb
      ) AS rule_bundles
  FROM events_attendanceevent AS e
  LEFT JOIN events_attendanceevent_rule_bundles AS r
      ON r.attendanceevent_id = e.event_id
  GROUP BY 
      e.event_id,
      e.max_capacity,
      e.registration_end,
      e.registration_start,
      e.unattend_deadline
) AS t;
*/
async function getEventAttendance() {
  const fpath = path.resolve(import.meta.dirname, "event_attendance.json")
  const rawData = JSON.parse((await fs.readFile(fpath)).toString())
  return AttendanceEventSchema.array().parse(rawData)
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

function getGradesFromFieldOfStudyRulesId(id: number): number[] {
  switch (id) {
    case 1: // Software Systems (Master)
      return [4, 5]
    case 2: // Databases and Search (Master)
      return [4, 5]
    case 3: // Algorithms and Computers (Master)
      return [4, 5]
    case 4: // Game Technology (Master)
      return [4, 5]
    case 5: // Artificial Intelligence (Master)
      return [4, 5]
    case 6: // Health Informatics (Master)
      return [4, 5]
    case 7: // Other Master's degree
      return [4, 5]
    case 8: // PhD
      return [5]
    case 9: // Bachelor in Computer Science
      return [1, 2, 3]
    case 10: // Bachelor in Computer Science
      return [1, 2, 3]
    case 25: // Bachelor in Computer Science
      return [1, 2, 3]
    case 41: // PhD
      return [5]
    case 46: // Interaction Design, Game & Learning Technology (Master)
      return [4, 5]
    case 47: // PhD
      return [5]
    case 48: // Social Member
      return []
    case 49: // Social Member
      return []
    case 50: // Guest
      return []
    default:
      return []
  }
}

const configuration = createConfiguration()
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
  const eventAttendances = await getEventAttendance()

  const existingUsers = new Set((await prisma.user.findMany({ select: { id: true } })).map((user) => user.id))
  const existingEvents = new Set(
    (
      await prisma.event.findMany({
        select: { metadataImportId: true },
        where: {
          metadataImportId: {
            not: null,
          },
        },
      })
    ).map((event) => event.metadataImportId)
  )

  const eventEndCutoff = new Date("2025-08-11")
  const relevantEvents = events
    .filter((event) => new Date(event.event_end) < eventEndCutoff && !existingEvents.has(event.id))
    .toSorted((a, b) => a.event_start.localeCompare(b.event_start))

  for (const event of relevantEvents) {
    await prisma.$transaction(async (tsx) => {
      let poolString = null
      let grades = null
      let users = null
      const eventAttendance = eventAttendances.find((a) => a.event_id === event.id)
      let yearCriteria = null
      if (event.is_attendance_event && eventAttendance) {
        const ruleStrings = []
        grades = []
        for (const ruleBundleId of eventAttendance.rule_bundles) {
          const ruleBundle = ruleBundles.get(ruleBundleId)
          if (!ruleBundle) {
            continue
          }

          if (ruleBundle.description && ruleBundle.description.trim().length > 0) {
            ruleStrings.push(ruleBundle.description.trim())
          }

          for (const gradeRuleId of ruleBundle.grade_rules) {
            const gradeRule = gradeRules.get(gradeRuleId)

            if (gradeRule) {
              grades.push(gradeRule.grade)
            }
          }
        }

        for (const ruleBundleId of eventAttendance.rule_bundles) {
          const ruleBundle = ruleBundles.get(ruleBundleId)

          if (!ruleBundle) {
            continue
          }

          const fieldOfStudyGrades = ruleBundle.field_of_study_rules.flatMap(getGradesFromFieldOfStudyRulesId)
          grades.push(...fieldOfStudyGrades)
        }

        grades = [...new Set(grades)].toSorted((a, b) => a - b)

        poolString = ruleStrings.filter((a) => a.trim().length > 0).join(", ")
        poolString = poolString.length === 0 ? "Alle" : poolString

        users = eventAttendees.get(event.id) ?? []

        yearCriteria = grades.filter((grade) => grade >= 1 && grade <= 5)
        if (yearCriteria.length === 0) {
          yearCriteria = [1, 2, 3, 4, 5]
        }
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
            eventAttendance && poolString && yearCriteria
              ? {
                  create: {
                    registerStart: eventAttendance.registration_start,
                    registerEnd: eventAttendance.registration_end,
                    deregisterDeadline: eventAttendance.unattend_deadline,
                    pools: {
                      create: {
                        capacity: eventAttendance.max_capacity,
                        title: poolString,
                        yearCriteria,
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
            .filter(({ userId }) => userId && existingUsers.has(userId))
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
