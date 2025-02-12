import { createPrisma } from "."
import { getAttendanceFixtures } from "./fixtures/attendance"
import { getPoolFixtures } from "./fixtures/attendance-pool"
import { getCommitteeFixtures } from "./fixtures/committee"
import { getEventCommitteeFixtures } from "./fixtures/committee-organizer"
import { getCompanyFixtures } from "./fixtures/company"
import { getEventFixtures } from "./fixtures/event"
import { getInterestGroupFixtures } from "./fixtures/interest-group"
import {
  getJobListingFixtures,
  getJobListingLocationFixtures,
  getJobListingLocationLinkFixtures,
} from "./fixtures/job-listing"
import { getMarkFixtures } from "./fixtures/mark"
import { getOfflineFixtures } from "./fixtures/offline"
import { getProductFixtures } from "./fixtures/product"
import { getProductPaymentProviderFixtures } from "./fixtures/product-payment-provider"

if (process.env.DATABASE_URL === undefined) {
  throw new Error("Missing database url")
}

const db = createPrisma(process.env.DATABASE_URL)

const companies = await db.company.createManyAndReturn({ data: getCompanyFixtures() });
const committees = await db.committee.createManyAndReturn({ data: getCommitteeFixtures() });
const attendances = await db.attendance.createManyAndReturn({ data: getAttendanceFixtures() });
const events = await db.event.createManyAndReturn({ data: getEventFixtures(attendances.map(a => a.id)) });
const attendancePool = await db.attendancePool.createManyAndReturn({ data: getPoolFixtures(attendances.map(a => a.id)) });
const marks = await db.mark.createManyAndReturn({ data: getMarkFixtures() });
const products = await db.product.createManyAndReturn({ data: getProductFixtures() });

const jobListings = await db.jobListing.createManyAndReturn({
  data: getJobListingFixtures(companies[0].id),
});

const jobListingLocations = await db.jobListingLocation.createManyAndReturn({
  data: getJobListingLocationFixtures(),
});

await db.jobListingLocationLink.createMany({
  data: getJobListingLocationLinkFixtures(jobListings.map(l => l.id), jobListingLocations.map(l => l.id)),
});

await db.offline.createMany({
  data: getOfflineFixtures(),
});

await db.interestGroup.createMany({
  data: getInterestGroupFixtures(),
});

await db.eventCommittee.createManyAndReturn({
  data: getEventCommitteeFixtures(events.map(e => e.id), committees.map(c => c.id)),
});

await db.productPaymentProvider.createMany({
  data: getProductPaymentProviderFixtures(products.map(p => p.id)),
});
