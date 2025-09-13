import { createPrisma } from "./index.ts"
import { getAttendanceFixtures } from "./fixtures/attendance.ts"
import { getPoolFixtures } from "./fixtures/attendance-pool.ts"
import { getCompanyFixtures } from "./fixtures/company.ts"
import { getEventFixtures } from "./fixtures/event.ts"
import { getEventHostingGroupFixtures } from "./fixtures/event-hosting-group.ts"
import { getGroupFixtures, getGroupRoleFixtures } from "./fixtures/group.ts"
import { getJobListingFixtures, getJobListingLocationFixtures } from "./fixtures/job-listing.ts"
import { getMarkFixtures } from "./fixtures/mark.ts"
import { getMembershipFixtures } from "./fixtures/membership.ts"
import { getOfflineFixtures } from "./fixtures/offline.ts"
import { getUserFixtures } from "./fixtures/user.ts"

if (process.env.DATABASE_URL === undefined) {
  throw new Error("Missing database url")
}

if (process.env.DATABASE_URL.includes("prod")) {
  throw new Error("Tried adding fixtures to a production database")
}

const db = createPrisma(process.env.DATABASE_URL)

// The ordering of things is *somewhat* important here, as some things depend on others. Developers modifying or adding
// entires to this file should consider what makes sense for a user of the app to make first.

const userInput = getUserFixtures()
await db.user.createManyAndReturn({ data: userInput })
const membershipInput = getMembershipFixtures(userInput.map((u) => u.id))
await db.membership.createManyAndReturn({ data: membershipInput })

const companyInput = getCompanyFixtures()
const companies = await db.company.createManyAndReturn({ data: companyInput })

const groupInput = getGroupFixtures()
await db.group.createManyAndReturn({ data: groupInput })
const groupRoleInput = groupInput.flatMap(getGroupRoleFixtures)
await db.groupRole.createManyAndReturn({ data: groupRoleInput })

const attendanceInput = getAttendanceFixtures()
const attendances = await db.attendance.createManyAndReturn({ data: attendanceInput })
const eventInput = getEventFixtures(attendances.map((a) => a.id))
const events = await db.event.createManyAndReturn({ data: eventInput })
const attendancePoolInput = getPoolFixtures(attendances.map((a) => a.id))
await db.attendancePool.createManyAndReturn({ data: attendancePoolInput })
const eventHostingGroupInput = getEventHostingGroupFixtures(events.map((e) => e.id))
await db.eventHostingGroup.createManyAndReturn({ data: eventHostingGroupInput })

const markInput = getMarkFixtures()
await db.mark.createManyAndReturn({ data: markInput })

const jobListingInput = getJobListingFixtures(companies.map((company) => company.id))
const jobListings = await db.jobListing.createManyAndReturn({ data: jobListingInput })
const jobListingLocationInput = getJobListingLocationFixtures(jobListings.map((jobListing) => jobListing.id))
await db.jobListingLocation.createManyAndReturn({ data: jobListingLocationInput })

const offlineInput = getOfflineFixtures()
await db.offline.createMany({ data: offlineInput })
