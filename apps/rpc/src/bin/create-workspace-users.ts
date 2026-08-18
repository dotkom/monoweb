import { createConfiguration } from "../configuration"
import type { CommitteeGroupSlug } from "../modules/authorization-service"
import { createServiceLayer, createThirdPartyClients } from "../modules/core"

const PERSONS = [
  { name: "Brage Andreas Hoven", committee: "dotkom" }, //
] as const satisfies { name: string; committee: CommitteeGroupSlug }[]

const FULL_NAMES = PERSONS.map((user) => user.name)

function findDuplicateNames(fullNames: readonly string[]): string[] {
  const seen = new Set<string>()
  const duplicates = new Set<string>()

  for (const fullName of fullNames) {
    if (seen.has(fullName)) {
      duplicates.add(fullName)
    }

    seen.add(fullName)
  }

  return [...duplicates]
}

function mapDbUserToPerson(
  persons: readonly { name: string; committee: CommitteeGroupSlug }[],
  users: { id: string; name: string | null }[]
): { id: string; name: string; committee: CommitteeGroupSlug }[] {
  const usersByName = new Map<string, { id: string; name: string | null }[]>()

  for (const user of users) {
    if (user.name === null) {
      continue
    }

    const existing = usersByName.get(user.name) ?? []
    existing.push(user)
    usersByName.set(user.name, existing)
  }

  const missingNames: string[] = []
  const ambiguousNames: string[] = []

  for (const person of persons) {
    const matches = usersByName.get(person.name) ?? []

    if (matches.length === 0) {
      missingNames.push(person.name)
    }

    if (matches.length > 1) {
      ambiguousNames.push(person.name)
    }
  }

  if (missingNames.length > 0 || ambiguousNames.length > 0) {
    const messages: string[] = []

    if (missingNames.length > 0) {
      messages.push(`Users not found: ${missingNames.join(", ")}`)
    }

    if (ambiguousNames.length > 0) {
      messages.push(`Multiple users found for: ${ambiguousNames.join(", ")}`)
    }

    throw new Error(messages.join("\n"))
  }

  return persons.map((person) => {
    const user = usersByName.get(person.name)?.[0]

    if (!user || user.name === null) {
      throw new Error(`User not found: ${person.name}`)
    }

    return { id: user.id, name: user.name, committee: person.committee }
  })
}

const duplicateInputNames = findDuplicateNames(FULL_NAMES)

if (duplicateInputNames.length > 0) {
  throw new Error(`Duplicate names in FULL_NAMES: ${duplicateInputNames.join(", ")}`)
}

// @ts-ignore LOLOLOLOL
if (FULL_NAMES.length === 0) {
  throw new Error("FULL_NAMES is empty. Add full names to the array at the top of this file.")
}

let configuration = createConfiguration()
configuration = {
  ...configuration,
  email: {
    ...configuration.email,
    awsSqsQueueUrl: "https://sqs.eu-north-1.amazonaws.com/891459268445/monoweb-brage-email-test",
  },
}

const dependencies = createThirdPartyClients(configuration)
const serviceLayer = await createServiceLayer(dependencies, configuration)

const { prisma, workspaceService } = serviceLayer

if (workspaceService === null) {
  throw new Error("Workspace service is not available. Check Google Workspace configuration.")
}

const usersFromDatabase = await prisma.user.findMany({
  where: {
    name: { in: [...FULL_NAMES] },
  },
  select: {
    id: true,
    name: true,
  },
})

const users = mapDbUserToPerson(PERSONS, usersFromDatabase)

console.log(`Found ${users.length} users. Creating workspace accounts...`)

const controller = new AbortController()

console.log("Starting email worker...")
serviceLayer.emailService.startWorker(controller.signal)

await new Promise((resolve) => setTimeout(resolve, 5_000))

for (const user of users) {
  console.log(`Creating workspace user for ${user.name} (${user.id})...`)

  const result = await workspaceService.createWorkspaceUser(prisma, user.id, user.committee)

  console.log(`  Password: ${result.password}`)
}

console.log("Done. Aborting email worker...")

await new Promise((resolve) => setTimeout(resolve, 30_000))
controller.abort()

console.log("Done.")
