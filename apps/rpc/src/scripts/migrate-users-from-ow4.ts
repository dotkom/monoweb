import { createConfiguration } from "src/configuration"
import { createServiceLayer, createThirdPartyClients } from "src/modules/core"

import { TZDate } from "@date-fns/tz"
import { type Membership, type UserId, type UserWrite, UserWriteSchema } from "@dotkomonline/types"

import fsp from "node:fs/promises"
import path from "node:path"
import type { DBHandle } from "@dotkomonline/db"
import type { ManagementClient } from "auth0"
import { z } from "zod"

const configuration = createConfiguration()
const dependencies = createThirdPartyClients(configuration)
const serviceLayer = await createServiceLayer(dependencies, configuration)
const prisma = serviceLayer.prisma

const OW4UserSchema = z.object({
  id: z.number(),
  is_superuser: z.boolean(),
  username: z.string(),
  first_name: z.string(),
  last_name: z.string(),
  email: z.string(),
  is_staff: z.boolean(),
  is_active: z.boolean(),
  date_joined: z.string().transform((date) => new TZDate(date, "UTC")),
  field_of_study: z.number(),
  started_date: z.string().transform((date) => new TZDate(date, "UTC")),
  compiled: z.boolean(),
  infomail: z.boolean(),
  phone_number: z.string().nullable(),
  address: z.string().nullable(),
  zip_code: z.string().nullable(),
  allergies: z.string().nullable(),
  rfid: z.string().nullable(),
  ntnu_username: z.string().nullable(),
  nickname: z.string().nullable(),
  website: z.string().nullable(),
  gender: z.string(),
  online_mail: z.string().nullable(),
  jobmail: z.boolean(),
  bio: z.string(),
  github: z.string().nullable(),
  linkedin: z.string().nullable(),
  auth0_subject: z.string().nullable(),
})
type OW4User = z.infer<typeof OW4UserSchema>

const OW4MembershipSchema = z.object({
  id: z.number(),
  username: z.string(),
  registered: z.string().transform((date) => new TZDate(date, "UTC")),
  note: z.string(),
  expiration_date: z.string().transform((date) => new TZDate(date, "UTC")),
  description: z.string().nullable(),
})
type OW4Membership = z.infer<typeof OW4MembershipSchema>

const pathOfThisScript = import.meta.dirname

const rawUsers = JSON.parse(
  await fsp.readFile(path.resolve(pathOfThisScript, "./authentication_onlineuser.json"), "utf-8")
)
const rawMemberships = JSON.parse(
  await fsp.readFile(path.resolve(pathOfThisScript, "./authentication_membership.json"), "utf-8")
)

const users = OW4UserSchema.array().parse(rawUsers)
const memberships = OW4MembershipSchema.array().parse(rawMemberships)

for (const user of users) {
  const membership = memberships.find((m) => m.username === user.ntnu_username)

  if (user.auth0_subject === null) {
    console.error(`User with OW4 id ${user.id} is missing auth0 subject`)
    continue
  }

  const existingUser = await prisma.user.findUnique({ where: { id: user.auth0_subject } })
  if (existingUser !== null) {
    console.log(`User with id ${user.auth0_subject} already exists`)
    continue
  }

  const auth0User = await getAuth0User(prisma, dependencies.auth0Client, user.auth0_subject)
  if (auth0User === null) {
    console.error(`Auth0 user with id ${user.auth0_subject} not found`)
    continue
  }

  let slug = auth0User.profileSlug
  if (user.username.length > 0) {
    const match = await prisma.user.findUnique({ where: { profileSlug: user.username } })
    if (!match) {
      slug = user.username
    }
  }

  const name = user.first_name || user.last_name ? `${user.first_name} ${user.last_name}`.trim() : auth0User.name

  await prisma.user.create({
    data: {
      id: user.auth0_subject,
      biography: auth0User.biography ?? user.bio,
      createdAt: user.started_date,
      dietaryRestrictions: auth0User.dietaryRestrictions ?? user.allergies,
      email: auth0User.email ?? user.email,
      gender: getGender(auth0User.gender ?? user.gender),
      profileSlug: slug,
      name: name,
      phone: auth0User.phone ?? user.phone_number,
      ntnuUsername: user.ntnu_username,
      imageUrl: auth0User.imageUrl,
      memberships: {
        createMany: {
          data: membership
            ? [
                {
                  end: membership.expiration_date,
                  start: membership.registered,
                  type: getMembershipType(user, membership),
                  specialization: getMembershipSpecialization(user.field_of_study),
                },
              ]
            : [],
        },
      },
    },
  })
}

async function getAuth0User(
  handle: DBHandle,
  managementClient: ManagementClient,
  userId: UserId
): Promise<UserWrite | null> {
  try {
    const response = await managementClient.users.get({ id: userId })
    if (response.status !== 200) {
      return null
    }

    const requestedSlug = UserWriteSchema.shape.profileSlug
      .catch(crypto.randomUUID())
      .parse(response.data.app_metadata?.username)

    const match = await handle.user.findUnique({ where: { profileSlug: requestedSlug } })
    const slug = match !== null ? crypto.randomUUID() : requestedSlug

    const user: UserWrite = {
      profileSlug: slug,
      name: response.data.name,
      email: response.data.email,
      imageUrl: response.data.picture,
      biography: response.data.app_metadata?.biography || null,
      phone: response.data.app_metadata?.phone || null,
      dietaryRestrictions: response.data.app_metadata?.allergies || null,
      gender: response.data.app_metadata?.gender || response.data.gender || null,
      // This would be very difficult to migrate, as ow4 stores only email local (before @), and we need id
      // We would need to fetch every single user and try to match them by their names and hope for the best
      workspaceUserId: null,
    }

    return user
  } catch (_err) {
    return null
  }
}

// https://github.com/dotkom/onlineweb4/blob/main/apps/authentication/constants.py#L21

function getMembershipType(user: OW4User, membership: OW4Membership): Membership["type"] {
  // Memberships with manual expiration date >= 2100 are knights
  if (membership.expiration_date >= new TZDate(2100, 1, 1)) return "KNIGHT"

  const fieldOfStudy = user.field_of_study

  if (fieldOfStudy >= 10 && fieldOfStudy <= 30) return "MASTER_STUDENT"

  switch (fieldOfStudy) {
    case 1:
      return "BACHELOR_STUDENT"
    case 40:
      return "SOCIAL_MEMBER"
    case 80:
      return "PHD_STUDENT"
    default:
      return "OTHER"
  }
}

function getMembershipSpecialization(fieldOfStudy: number): Membership["specialization"] {
  switch (fieldOfStudy) {
    case 10:
      return "SOFTWARE_ENGINEERING"
    case 11:
      return "DATABASE_AND_SEARCH"
    case 14:
      return "ARTIFICIAL_INTELLIGENCE"
    case 16:
      return "INTERACTION_DESIGN"
    default:
      return "UNKNOWN"
  }
}

function getGender(gender?: string) {
  switch (gender) {
    case "male":
      return "Mann"
    case "female":
      return "Kvinne"
    default:
      return null
  }
}
