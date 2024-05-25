import crypto from "node:crypto"
import type { CommitteeWrite, CompanyWrite, JobListingWrite, UserWrite } from "@dotkomonline/types"
import type { ApiResponse, GetUsers200ResponseOneOfInner } from "auth0"
import { addWeeks, addYears } from "date-fns"
import { ulid } from "ulid"

export const mockAuth0UserResponse = (
  user: Partial<UserWrite>,
  status?: number,
  statusText?: string
): ApiResponse<GetUsers200ResponseOneOfInner> =>
  ({
    data: getAuth0UserMock(user),
    headers: {},
    status: status ?? 200,
    statusText: statusText ?? "OK",
  }) as unknown as ApiResponse<GetUsers200ResponseOneOfInner> // to avoid having to write out headers fake data

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
      middle_name: write?.middleName ?? "Mellomnavn",
    },
  }) as unknown as GetUsers200ResponseOneOfInner

export const getCommitteeMock = (defaults?: Partial<CommitteeWrite>): CommitteeWrite => ({
  name: "Test Committee",
  description: "This is a test committee",
  email: "test-mail-that-does-not-exist6123123@gmail.com",
  image: "https://example.com/logo.png",
  ...defaults,
})

export const getUserMock = (defaults?: Partial<UserWrite>): UserWrite => ({
  auth0Id: crypto.randomUUID(),
  studyYear: 0,
  email: "test-mail-that-does-not-exist6123123@gmail.com",
  givenName: "Test",
  middleName: "Test",
  familyName: "User",
  name: "Test User",
  lastSyncedAt: new Date(),
  allergies: [],
  gender: "other",
  phone: null,
  picture: null,
  ...defaults,
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
