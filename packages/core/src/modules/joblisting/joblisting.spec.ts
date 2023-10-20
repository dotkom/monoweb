import { kysely } from "@dotkomonline/db"
import { JobListingRepository, JobListingRepositoryImpl } from "./joblisting-repository"
import util from "util"
import { JobListingServiceImpl } from "./joblisting-service"

export function deepLog(obj: unknown) {
  console.log(util.inspect(obj, { depth: null, colors: true }))
}

describe("repository manual testing", () => {
  const repo: JobListingRepository = new JobListingRepositoryImpl(kysely)

  it("repo get by id", async () => {
    const t = await repo.getById("01HD77R4Y4S3WJ44NZ8029VP4P")
    deepLog(t)
  })

  // get latest
  it("repo get latest", async () => {
    const t = await repo.getAll(1)
    deepLog(t)
  })

  // create
  it("repo create", async () => {
    const t = await repo.create(
      {
        companyId: "01HB64TWZJD1F83E5XNB96NF2R",
        title: "Henrik sin jobb",
        ingress: "Join us at Bekk!",
        description: "Et konsulentselskap som forøvrig er hovedsponsor for Online Linjeforening",
        start: new Date("2023-03-15"), // Placeholder date
        end: new Date("2023-12-31"), // Placeholder date
        featured: true, // Placeholder value
        deadline: null,
        employment: "Fulltid",
        applicationLink: "https://bekk.no/jobs", // Placeholder link
        applicationEmail: "bekk@bekk.no",
        deadlineAsap: false, // Placeholder value
      },
      ["tromsø"]
    )

    deepLog(t)
  })

  it("repo update", async () => {
    const t = await repo.update(
      "01HD77R4Y4S3WJ44NZ8029VP4P",
      {
        companyId: "01HB64TWZJD1F83E5XNB96NF2R",
        title: "Job at Bekk",
        ingress: "Join us at Bekk!",
        description: "Et konsulentselskap som forøvrig er hovedsponsor for Online Linjeforening",
        start: new Date("2023-03-15"), // Placeholder date
        end: new Date("2023-12-31"), // Placeholder date
        featured: true, // Placeholder value
        deadline: null,
        employment: "Sommerjobb/internship",
        applicationLink: "https://bekk.no/jobs", // Placeholder link
        applicationEmail: "bekk@bekk.no",
        deadlineAsap: false, // Placeholder value
      },
      ["tromsø"]
    )
    deepLog(t)
  })
})

describe("service manual testing", () => {
  const repo: JobListingRepository = new JobListingRepositoryImpl(kysely)
  const service = new JobListingServiceImpl(repo)

  it("service get by id", async () => {
    const t = await service.get("01HD77R4Y4S3WJ44NZ8029VP4P")
    deepLog(t)
  })

  // get latest
  it("service get latest", async () => {
    const t = await service.getAll(1)
    deepLog(t)
  })

  // create
  it("service create", async () => {
    const t = await service.create({
      companyId: "01HB64TWZJD1F83E5XNB96NF2R",
      title: "123123123",
      ingress: "Join us at Bekk!",
      description: "Et konsulentselskap som forøvrig er hovedsponsor for Online Linjeforening",
      start: new Date("2023-03-15"), // Placeholder date
      end: new Date("2023-12-31"), // Placeholder date
      featured: true, // Placeholder value
      deadline: null,
      employment: "Fulltid",
      applicationLink: "https://bekk.no/jobs", // Placeholder link
      applicationEmail: "bekk@bekk.no",
      deadlineAsap: false, // Placeholder value
      locations: ["tromsø"],
    })

    deepLog(t)
  })

  it("service update", async () => {
    const t = await service.update("01HD7NFYRP1W50828JKXYB1G4Y", {
      companyId: "01HB64TWZJD1F83E5XNB96NF2R",
      title: "Job at Bekk 12313213",
      ingress: "Join us at Bekk!",
      description: "Et konsulentselskap som forøvrig er hovedsponsor for Online Linjeforening",
      start: new Date("2023-03-15"), // Placeholder date
      end: new Date("2023-12-31"), // Placeholder date
      featured: true, // Placeholder value
      deadline: null,
      employment: "Sommerjobb/internship",
      applicationLink: "https://bekk.no/jobs", // Placeholder link
      applicationEmail: "bekk@bekk.no",
      deadlineAsap: false, // Placeholder value
      locations: ["henrik"],
    })
    deepLog(t)
  })
})
