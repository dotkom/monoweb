// see migrating-from-ow4.md for more information

import fs from "node:fs"
import { prisma } from "../services"

// @ts-ignore does not exist before running dumpSanityData
import dumpedData from "./dumpedData.json" assert { type: "json" }

async function dumpSanityData() {
  // Sanity configuration
  const SANITY_PROJECT_ID = "wsqi2mae"
  const SANITY_DATASET = "production"
  const SANITY_API_VERSION = "2023-05-03"

  // Sanity query
  const query = `*[_type == "offline"]`
  const url = `https://${SANITY_PROJECT_ID}.api.sanity.io/v${SANITY_API_VERSION}/data/query/${SANITY_DATASET}?query=${encodeURIComponent(
    query
  )}`

  const response = await fetch(url)
  const { result } = await response.json()
  fs.writeFileSync("./dumpedData.json", JSON.stringify(result, null, 2))
}

async function insertDump() {
  for (const item of dumpedData) {
    await prisma.offline.create({
      data: {
        title: item.title,
        published: new Date(item.release_date),
        fileUrl: item.pdf.asset._ref,
        imageUrl: item.thumbnail.asset._ref,
      },
    })
  }
}

await dumpSanityData()
await insertDump()
