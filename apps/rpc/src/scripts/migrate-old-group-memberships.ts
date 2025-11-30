import fsp from "node:fs/promises"
import path from "node:path"
import { TZDate } from "@date-fns/tz"
import type { GroupRoleType } from "@dotkomonline/types"
import { areIntervalsOverlapping, isFuture, isSameDay } from "date-fns"
import { createConfiguration } from "src/configuration"
import { z } from "zod"
import { createServiceLayer, createThirdPartyClients } from "../modules/core"

/*
select
  committee,
  position,
  auth0_subject,
  period_end,
  period_start
from
  authentication_position position
  left join authentication_onlineuser on authentication_onlineuser.id = position.user_id
*/
async function getPositions() {
  const pathOfThisScript = import.meta.dirname

  const data = JSON.parse(await fsp.readFile(path.resolve(pathOfThisScript, "./ow4_positions.json"), "utf-8"))

  return Ow4GroupMembershipSchema.array().parse(data)
}

function mapPositionToGroupRoleType(position: string): GroupRoleType | null {
  switch (position) {
    case "leder":
      return "LEADER"
    case "medlem":
      return "COSMETIC"
    case "nestleder":
      return "DEPUTY_LEADER"
    case "okans":
      return "TREASURER"
    default:
      return null
  }
}

const configuration = createConfiguration()

const dependencies = createThirdPartyClients(configuration)
const serviceLayer = await createServiceLayer(dependencies, configuration)
const prisma = serviceLayer.prisma

const Ow4GroupMembershipSchema = z.object({
  position: z.string(),
  period_end: z.string().transform((period_end) => new TZDate(period_end, "UTC")),
  period_start: z.string().transform((period_start) => new TZDate(period_start, "UTC")),
  auth0_subject: z.string(),
  committee: z.string(),
})

const existingMemberships = await prisma.groupMembership.findMany()
const ow4memberships = await getPositions()
const existingUsers = new Set((await prisma.user.findMany({ select: { id: true } })).map((user) => user.id))

const groups = await serviceLayer.groupService.findMany(prisma)

for (const ow4membership of ow4memberships) {
  if (isFuture(ow4membership.period_end)) {
    continue
  }

  if (isSameDay(ow4membership.period_start, ow4membership.period_end)) {
    continue
  }

  // Online started in 1985
  if (ow4membership.period_end < new TZDate("1985-01-01")) {
    continue
  }

  if (!existingUsers.has(ow4membership.auth0_subject)) {
    continue
  }

  const matchingMemberships = existingMemberships.filter(
    (m) => m.userId === ow4membership.auth0_subject && m.groupId === ow4membership.committee
  )

  if (
    matchingMemberships.some((match) =>
      areIntervalsOverlapping(
        { start: ow4membership.period_start, end: ow4membership.period_end },
        { start: match.start, end: match.end ?? new TZDate(3000, 1) }
      )
    )
  ) {
    continue
  }

  const group = groups.find((g) => g.slug === ow4membership.committee)
  if (!group) {
    continue
  }

  const positionRoleType = mapPositionToGroupRoleType(ow4membership.position)
  let role = group.roles.find(
    (r) => r.type === positionRoleType || (ow4membership.position === "redaktor" && r.name === "Redaktør")
  )

  // We don't have a "Redaktør" role type anymore so we create a role for it if the group doesn't have it
  if (!role && ow4membership.position === "redaktor") {
    role = await serviceLayer.groupService.createRole(prisma, {
      name: "Redaktør",
      groupId: group.slug,
      type: "COSMETIC",
    })

    group.roles.push(role)
  }

  if (!role) {
    continue
  }

  const createdMembership = await prisma.groupMembership.create({
    data: {
      groupId: group.slug,
      userId: ow4membership.auth0_subject,
      start: ow4membership.period_start,
      end: ow4membership.period_end,
      roles: {
        create: { roleId: role.id },
      },
    },
  })

  existingMemberships.push(createdMembership)
}
