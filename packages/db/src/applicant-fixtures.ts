import {
  APPLICANT_FIXTURE_EMAIL_DOMAIN,
  APPLICANT_FIXTURE_GROUP_SLUGS,
  APPLICANT_FIXTURE_PERIOD_IDS,
  getApplicantFixtures,
} from "./fixtures/applicant"
import { createPrisma } from "./index"

// Applies the bulk committee application fixtures on top of a database that already has the primary fixtures. Running
// it again replaces the previous bulk data, and nothing outside of it is touched.

if (process.env.DATABASE_URL === undefined) {
  throw new Error("Missing database url")
}

if (process.env.DATABASE_URL.includes("prod")) {
  throw new Error("Tried adding fixtures to a production database")
}

const db = createPrisma(process.env.DATABASE_URL)

const groupCount = await db.group.count({ where: { slug: { in: [...APPLICANT_FIXTURE_GROUP_SLUGS] } } })

if (groupCount !== APPLICANT_FIXTURE_GROUP_SLUGS.length) {
  throw new Error(
    "Missing committees. Run `pnpm migrate:dev-with-applicant-fixtures` to apply the primary fixtures too"
  )
}

const fixtures = getApplicantFixtures()
const periodIds = Object.values(APPLICANT_FIXTURE_PERIOD_IDS)
const fixtureUsers = { email: { endsWith: `@${APPLICANT_FIXTURE_EMAIL_DOMAIN}` } }

await db.$transaction(
  async (handle) => {
    // Interviews restrict deleting their interview block, so they go first. Everything else below a period cascades
    // from its applications and committees.
    await handle.committeeApplicationInterview.deleteMany({
      where: { groupSelection: { applicationPeriodId: { in: periodIds } } },
    })
    await handle.committeeApplication.deleteMany({ where: { applicationPeriodId: { in: periodIds } } })
    await handle.committeeApplicationGroup.deleteMany({ where: { applicationPeriodId: { in: periodIds } } })
    await handle.committeeApplicationPeriod.deleteMany({ where: { id: { in: periodIds } } })
    await handle.membership.deleteMany({ where: { user: fixtureUsers } })
    await handle.user.deleteMany({ where: fixtureUsers })

    await handle.user.createMany({ data: fixtures.users })
    await handle.membership.createMany({ data: fixtures.memberships })
    await handle.privacyPermissions.createMany({ data: fixtures.privacyPermissions })
    await handle.notificationPermissions.createMany({ data: fixtures.notificationPermissions })
    await handle.groupMembership.createMany({ data: fixtures.groupMemberships })
    await handle.committeeApplicationPeriod.createMany({ data: fixtures.periods })
    await handle.committeeApplicationGroup.createMany({ data: fixtures.groups })
    await handle.committeeApplication.createMany({ data: fixtures.applications })
    await handle.committeeApplicationGroupSelection.createMany({ data: fixtures.groupSelections })
    await handle.committeeApplicationAvailability.createMany({ data: fixtures.availabilityBlocks })
    await handle.committeeApplicationInterviewBlock.createMany({ data: fixtures.interviewBlocks })
    await handle.committeeApplicationInterview.createMany({ data: fixtures.interviews })
    await handle.committeeApplicationInterviewAttendee.createMany({ data: fixtures.interviewAttendees })
  },
  { timeout: 120_000 }
)

console.log(
  `Applied applicant fixtures: ${fixtures.users.length} users, ${fixtures.periods.length} periods, ${fixtures.applications.length} applications and ${fixtures.interviews.length} interviews`
)

await db.$disconnect()
