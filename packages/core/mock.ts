import { type CompanyWrite, type JobListingWrite, type UserWrite } from "@dotkomonline/types"
import { addWeeks, addYears } from "date-fns"

export const getUserMock = (defaults: Partial<UserWrite> = {}): UserWrite => ({
  auth0Sub: "8697a463-46fe-49c2-b74c-f6cc98358298",
  studyYear: 0,
  email: "test-mail-that-does-not-exist6123123@gmail.com",
  givenName: "Test",
  familyName: "User",
  name: "Test User",
  lastSyncedAt: null,
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
