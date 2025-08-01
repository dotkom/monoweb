import type { CompanyWrite, JobListingWrite, UserWrite } from "@dotkomonline/types"
import { addWeeks, addYears } from "date-fns"

export const getUserMock = (defaults?: Partial<UserWrite>): UserWrite => ({
  email: "test-mail-that-does-not-exist6123123@gmail.com",
  imageUrl: null,
  name: "Test Test",
  dietaryRestrictions: null,
  gender: "other",
  phone: null,
  biography: null,
  profileSlug: "test-test",
  ...defaults,
})

export const getCompanyMock = (defaults: Partial<CompanyWrite> = {}): CompanyWrite => ({
  name: "Bekk",
  slug: "bekk",
  imageUrl: "https://example.com/logo.png",
  website: "https://example.com",
  description: "This is a test company",
  email: "foo@example.net",
  location: "Oslo",
  phone: "+47 123 45 678",
  ...defaults,
})

export const getJobListingMock = (defaults: Partial<JobListingWrite> = {}): JobListingWrite => ({
  title: "Core Developer",
  description:
    "As a Core Developer, you will design, implement, and optimize core functionalities of Vespa, ensuring top-notch performance and reliability.",
  about:
    "You will work on challenging search and recommendation use cases, collaborating with a cross-functional team of engineers and developer advocates.",
  start: addWeeks(addYears(new Date(), 1), 2),
  end: addWeeks(addYears(new Date(), 1), 4),
  featured: false,
  hidden: false,
  deadline: addWeeks(new Date(), 2),
  employment: "FULLTIME",
  applicationLink: "https://example.com",
  applicationEmail: "hello@example.com",
  deadlineAsap: false,
  updatedAt: new Date(),
  ...defaults,
})
