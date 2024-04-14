import type { CompanyWrite, JobListingWrite, UserWrite } from "@dotkomonline/types"
import type { GetUsers200ResponseOneOfInner } from "auth0"
import { addWeeks, addYears } from "date-fns"
import { ulid } from "ulid"

export const getAuth0UserMock = (write?: Partial<UserWrite>): GetUsers200ResponseOneOfInner =>
  ({
    user_id: write?.auth0Id ?? "auth0|test",
    email: write?.email ?? "fakeemail@gmai.com",
    given_name: write?.givenName ?? "Ola",
    family_name: write?.familyName ?? "Nordmann",
    name: write?.name ?? "Ola Mellomnavn Nordmann",
    picture: write?.picture ?? "https://example.com/image.jpg",
    app_metadata: {
      study_year: write?.studyYear ?? -1,
      last_synced_at: write?.lastSyncedAt ?? new Date(),
      ow_user_id: write?.id ?? ulid(),
    },
    user_metadata: {
      allergies: write?.allergies ?? ["gluten"],
      gender: write?.gender ?? "male",
      phone: write?.phone ?? "004712345678",
    },
  }) as unknown as GetUsers200ResponseOneOfInner

export const getUserMock = (defaults: Partial<UserWrite> = {}): UserWrite => ({
  auth0Id: "8697a463-46fe-49c2-b74c-f6cc98358298",
  studyYear: 0,
  email: "test-mail-that-does-not-exist6123123@gmail.com",
  givenName: "Test",
  familyName: "User",
  name: "Test User",
  lastSyncedAt: new Date(),
  allergies: [],
  gender: "other",
  phone: null,
  picture: null,
})

export const getCompanyMock = (defaults: Partial<CompanyWrite> = {}): CompanyWrite => ({
  name: "Bekk",
  image: "https://example.com/logo.png",
  website: "https://example.com",
  description: "This is a test company",
  email: "foo@example.net",
  location: "Oslo",
  phone: "+47 123 45 678",
  type: "Consulting",
  ...defaults,
})

export const getJobListingMock = (companyId: string, defaults: Partial<JobListingWrite> = {}): JobListingWrite => ({
  createdAt: new Date(),
  companyId,
  title: "Core Developer",
  ingress:
    "As a Core Developer, you will design, implement, and optimize core functionalities of Vespa, ensuring top-notch performance and reliability.",
  description:
    "You will work on challenging search and recommendation use cases, collaborating with a cross-functional team of engineers and developer advocates.",
  start: addWeeks(addYears(new Date(), 1), 2),
  end: addWeeks(addYears(new Date(), 1), 4),
  featured: false,
  deadline: addWeeks(new Date(), 2),
  employment: "Fulltid",
  applicationLink: "https://example.com",
  applicationEmail: "hello@example.com",
  deadlineAsap: false,
  locations: ["Oslo", "Trondheim"],
  ...defaults,
})
