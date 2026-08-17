import fsp from "node:fs/promises"
import path from "node:path"
import { createConfiguration } from "src/configuration"
import { createServiceLayer, createThirdPartyClients } from "src/modules/core"
import { z } from "zod"

// Aliases are found using AI, and then manually verified.
// NB! Only aliases that are guaranteed to be correct should be flagged as useForSEO. These aliases are shown on the course page and used in metadata. The rest are only used for search.

// To export course data to provide an AI agent to generate an updated list of aliases, you can use this script:
/* 
  SELECT
  code,
  name_no,
  name_en
  FROM course
  WHERE candidate_count > 250 -- This can be adjusted if needed, but it's unlikely that courses with less than 250 candidates will have established aliases
  ORDER BY candidate_count DESC
  OFFSET 0 -- Start at offset 0, and increment by 100 to get the next 100 courses
  LIMIT 100; -- Limit to 100 courses at a time to not overwhelm the AI
 */

// To run the script, create a new file in the `scripts` folder called `aliases.json`
// and paste the aliases into the file with this shape:
/* 
  [
  {
      "code": "TDT4100",
      "alias": "objekt",
      "useForSEO": true
    },
  {
      "code": "TDT4100",
      "alias": "oop"
    },
  ]
 */

const AliasSchema = z.object({
  code: z.string(),
  alias: z.string(),
  useForSEO: z.boolean().optional().default(false),
})

const pathOfThisScript = import.meta.dirname

const configuration = createConfiguration()
const dependencies = createThirdPartyClients(configuration)
const serviceLayer = await createServiceLayer(dependencies)
const prisma = serviceLayer.prisma

const rawAliases = await fsp.readFile(path.resolve(pathOfThisScript, "./aliases.json"), "utf-8")
const aliases = AliasSchema.array().parse(JSON.parse(rawAliases))

const courses = await prisma.course.findMany({
  where: {
    code: {
      in: aliases.map((alias) => alias.code),
    },
  },
})

const data = aliases.flatMap((alias) => {
  const course = courses.find((course) => course.code === alias.code)
  if (course === undefined) {
    console.error(`Course with code ${alias.code} not found`)
    return []
  }

  return {
    courseId: course.id,
    alias: alias.alias,
    useForSEO: alias.useForSEO,
  }
})

console.log(`Creating or updating ${data.length} aliases`)

await Promise.all(
  data.map(async (alias) => {
    return prisma.courseAlias.upsert({
      where: {
        courseId_alias: {
          courseId: alias.courseId,
          alias: alias.alias,
        },
      },
      update: {
        useForSEO: alias.useForSEO,
      },
      create: {
        courseId: alias.courseId,
        alias: alias.alias,
        useForSEO: alias.useForSEO,
      },
    })
  })
)

console.log("Done")
