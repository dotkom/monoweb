import { createPrisma } from "."
import { getAttendanceFixtures } from "./fixtures/attendance"
import { getPoolFixtures } from "./fixtures/attendance-pool"
import { getCompanyFixtures } from "./fixtures/company"
import { getEventFixtures } from "./fixtures/event"
import { getEventHostingGroupFixtures } from "./fixtures/event-hosting-group"
import { getGroupFixtures, getGroupRoleFixtures } from "./fixtures/group"
import { getJobListingFixtures, getJobListingLocationFixtures } from "./fixtures/job-listing"
import { getMarkFixtures } from "./fixtures/mark"
import { getOfflineFixtures } from "./fixtures/offline"
import { getProductFixtures } from "./fixtures/product"
import { getProductPaymentProviderFixtures } from "./fixtures/product-payment-provider"

if (process.env.DATABASE_URL === undefined) {
  throw new Error("Missing database url")
}

if (process.env.DATABASE_URL.includes("prod")) {
  throw new Error("Tried adding fixtures to a production database")
}

const db = createPrisma(process.env.DATABASE_URL)

const companies = await db.company.createManyAndReturn({ data: getCompanyFixtures() })
await db.groupRole.createManyAndReturn({ data: getGroupRoleFixtures() })
const groups = await db.group.createManyAndReturn({ data: getGroupFixtures() })
const attendances = await db.attendance.createManyAndReturn({ data: getAttendanceFixtures() })
const events = await db.event.createManyAndReturn({ data: getEventFixtures(attendances.map((a) => a.id)) })
await db.attendancePool.createManyAndReturn({ data: getPoolFixtures(attendances.map((a) => a.id)) })
await db.mark.createManyAndReturn({ data: getMarkFixtures() })
const products = await db.product.createManyAndReturn({ data: getProductFixtures() })

const jobListings = await db.jobListing.createManyAndReturn({
  data: getJobListingFixtures(companies.map((company) => company.id)),
})

await db.jobListingLocation.createManyAndReturn({
  data: getJobListingLocationFixtures(jobListings.map((jobListing) => jobListing.id)),
})

await db.offline.createMany({
  data: getOfflineFixtures(),
})

await db.eventHostingGroup.createManyAndReturn({
  data: getEventHostingGroupFixtures(events.map((e) => e.id)),
})

await db.productPaymentProvider.createMany({
  data: getProductPaymentProviderFixtures(products.map((p) => p.id)),
})
