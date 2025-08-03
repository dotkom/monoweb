import fs from "node:fs"
import fsp from "node:fs/promises"
import path from "node:path"
import { exit } from "node:process"
import { Command } from "commander"
import { marked } from "marked"

const dependencies = createThirdPartyClients(configuration)
const serviceLayer = await createServiceLayer(dependencies, configuration)
const prisma = serviceLayer.prisma

async function dumpData() {
  const PAGE_LIMIT = 20
  async function dumpGroups() {
    // Sanity configuration
    const result = []
    let page = 1
    const getGroupUrl = (page: number) =>
      `https://old.online.ntnu.no/api/v1/group/online-groups/?format=json&page=${page}`

    while (true) {
      const response = await fetch(getGroupUrl(page))
      const data = await response.json()
      if (data.next === null) {
        break
      }
      page++
      result.push(...data.results)

      if (page > PAGE_LIMIT) {
        console.error("Page limit reached in dumpGroups")
        exit(1)
      }
    }

    return result
  }

  async function dumpHobbys() {
    const result = []
    let page = 1
    const getHobbyUrl = (page: number) => `https://old.online.ntnu.no/api/v1/hobbys/?format=json&page=${page}`

    while (true) {
      const response = await fetch(getHobbyUrl(page))
      const data = await response.json()
      if (data.next === null) {
        break
      }
      page++
      result.push(...data.results)

      if (page > PAGE_LIMIT) {
        console.error("Page limit reached in dumpHobbys")
        exit(1)
      }
    }
    return result
  }

  const groups = await dumpGroups()
  const hobbies = await dumpHobbys()

  const pathOfThisScript = import.meta.dirname
  fs.writeFileSync(path.resolve(pathOfThisScript, "./groups.json"), JSON.stringify(groups, null, 2))
  fs.writeFileSync(path.resolve(pathOfThisScript, "./hobbys.json"), JSON.stringify(hobbies, null, 2))
}

import type { DBClient, Prisma } from "@dotkomonline/db"
import { getDefaultGroupMemberRoles } from "@dotkomonline/types"
import { slugify } from "@dotkomonline/utils"
import z from "zod"
import { configuration } from "../configuration"
import { createServiceLayer, createThirdPartyClients } from "../modules/core"

// Copied from group-service.ts
const createIdFromGroupName = async (prisma: DBClient, name: string) => {
  let id = slugify(name)
  for (let i = 1; ; i++) {
    const match = await prisma.group.findUnique({ where: { slug: id } })
    if (match === null) {
      break
    }
    // If the id already exists, we try something like slug-1
    id = `${slugify(name)}-${i}`
  }
  return id
}

async function insertDump() {
  const pathOfThisScript = import.meta.dirname
  // biome-ignore lint/suspicious/noExplicitAny: files don't exist and cannot provide types until they are created
  const groups = JSON.parse(await fsp.readFile(path.resolve(pathOfThisScript, "./groups.json"), "utf-8")) as any[]
  // biome-ignore lint/suspicious/noExplicitAny: files don't exist and cannot provide types until they are created
  const hobbies = JSON.parse(await fsp.readFile(path.resolve(pathOfThisScript, "./hobbys.json"), "utf-8")) as any[]

  const committees = groups.filter((item) => item.group_type === "committee")
  const nodeCommittees = groups.filter((item) => item.group_type === "node_committee")
  const interestGroups = hobbies
  const other = groups.filter((item) => item.group_type === "other")

  console.log("\nCOMMITEES: ")
  // biome-ignore lint/complexity/noForEach: <explanation>
  committees.forEach((item) => console.log(item.name_short))

  console.log("\nNODE COMMITTEES: ")
  // biome-ignore lint/complexity/noForEach: <explanation>
  nodeCommittees.forEach((item) => console.log(item.name_short))

  console.log("\nOTHER: ")
  // biome-ignore lint/complexity/noForEach: <explanation>
  other.forEach((item) => console.log(item.name_short))

  console.log("\nINTEREST GROUPS: ")
  // biome-ignore lint/complexity/noForEach: <explanation>
  interestGroups.forEach((item) => console.log(item.title))

  console.log("\n\nInserting interest groups:")
  for (const item of interestGroups) {
    console.log(`Inserting ${item.title}`)
    const title = item.title.replace(" [inaktiv]", "")
    const id = await createIdFromGroupName(prisma, title)
    await prisma.groupRole.createMany({ data: getDefaultGroupMemberRoles(id), skipDuplicates: true })
    await prisma.group.create({
      data: {
        slug: id,
        abbreviation: title,
        about: item.description || "",
        imageUrl: item.image?.original,
        type: "INTEREST_GROUP",
      },
    })
  }

  console.log("\n\nInserting committees:")
  for (const item of committees) {
    console.log(`Inserting ${item.name_short}`)
    const id = await createIdFromGroupName(prisma, item.name_short)
    await prisma.groupRole.createMany({ data: getDefaultGroupMemberRoles(id), skipDuplicates: true })
    await prisma.group.create({
      data: {
        slug: id,
        abbreviation: item.name_short,
        name: item.name_short,
        createdAt: item.created,
        about: item.description_long || item.application_description || "",
        description: item.description_short,
        email: item.email,
        imageUrl: item.image?.original,
        type: "COMMITTEE",
      },
    })
  }

  console.log("\n\nInserting node committees:")
  for (const item of nodeCommittees) {
    console.log(`Inserting ${item.name_short}`)
    const id = await createIdFromGroupName(prisma, item.name_short)
    await prisma.groupRole.createMany({ data: getDefaultGroupMemberRoles(id), skipDuplicates: true })
    await prisma.group.create({
      data: {
        slug: id,
        name: item.name_short,
        abbreviation: item.name_short,
        createdAt: item.created,
        about: item.description_long || item.application_description || "",
        description: item.description_short,
        email: item.email,
        imageUrl: item.image?.original,
        type: "NODE_COMMITTEE",
      },
    })
  }

  console.log("\n\nInserting other groups:")
  for (const item of other) {
    console.log(`Inserting ${item.name_short}`)
    const id = await createIdFromGroupName(prisma, item.name_short)
    await prisma.groupRole.createMany({ data: getDefaultGroupMemberRoles(id), skipDuplicates: true })
    await prisma.group.create({
      data: {
        slug: id,
        name: item.name_short,
        abbreviation: item.name_short,
        createdAt: item.created,
        about: item.description_long || item.application_description || "",
        description: item.description_short,
        email: item.email,
        imageUrl: item.image?.original,
        type: "ASSOCIATED",
      },
    })
  }
}

const program = new Command()

program.name("migrate-groups").description("CLI tool for migrating groups from OW4")

program
  .command("1")
  .description("Dump data from OW4 to JSON files")
  .action(async () => {
    try {
      await dumpData()
      console.log("Data successfully dumped to groups.json and hobbys.json")
    } catch (error) {
      console.error("Error dumping data:", error)
      process.exit(1)
    }
  })

program
  .command("2")
  .description("Insert dumped data into the database")
  .action(async () => {
    try {
      await insertDump()
      console.log("Data successfully inserted into database")
    } catch (error) {
      console.error("Error inserting data:", error)
      process.exit(1)
    }
  })

program
  .command("3")
  .description("Delete all groups from the database")
  .action(async () => {
    try {
      await prisma.group.deleteMany()
      console.log("Successfully deleted all groups")
    } catch (error) {
      console.error("Error deleting data:", error)
      process.exit(1)
    }
  })

program
  .command("4")
  .description("Run the complete migration process (dump and insert)")
  .action(async () => {
    try {
      await dumpData()
      console.log("Data successfully dumped")
      await insertDump()
      console.log("Data successfully inserted")
    } catch (error) {
      console.error("Error during migration:", error)
      process.exit(1)
    }
  })

program
  .command("5")
  .description("Show groups in database")
  .action(async () => {
    const groups = await prisma.group.findMany()
    console.log("\nGroups: \n", groups)
  })

async function listSplashEvents() {
  const events = []

  let url = "https://old.online.ntnu.no/api/v1/splash-events/?page=2&page_size=100000"

  while (true) {
    const response = await fetch(url)
    const data = z
      .object({
        next: z.string().nullable(),
        results: z.array(
          z.object({
            id: z.number(),
            title: z.string(),
            content: z.string(),
            start_time: z.string().transform((d) => new Date(d)),
            end_time: z.string().transform((d) => new Date(d)),
          })
        ),
      })
      .parse(await response.json())

    events.push(...data.results)

    if (data.next) {
      url = data.next
    } else {
      break
    }
  }

  return events
}

program
  .command("import-velkom-events")
  .description("Import events from splash")
  .action(async () => {
    const events = await listSplashEvents()

    const newEvents: Prisma.EventCreateManyInput[] = []

    for (const event of events) {
      if (event.start_time.getFullYear() !== 2025) {
        continue
      }

      newEvents.push({
        description: await marked(event.content),
        imageUrl: null,
        type: "WELCOME",
        status: "PUBLIC",
        title: event.title,
        start: event.start_time,
        end: event.end_time,
        subtitle: null,
        locationTitle: null,
        locationAddress: null,
        locationLink: null,
      })
    }

    await prisma.event.createMany({ data: newEvents })
  })

program.parse()
