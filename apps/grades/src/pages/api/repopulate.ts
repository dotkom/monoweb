import { type NextApiRequest, type NextApiResponse } from "next"
import { getLogger } from "@dotkomonline/logger"
import { createKysely } from "@/server/kysely"
import { createServiceLayer } from "@/server/core"

const logger = getLogger("api/repopulate")

export default async function route(req: NextApiRequest, res: NextApiResponse) {
  const skip = (req.query.skip as string | undefined)?.split(",")
  logger.info(`Initializing repopulation job with skip ${skip?.join(", ") ?? "<none>"}`)

  const kysely = await createKysely()
  const core = createServiceLayer({ fetch, db: kysely })

  if (!skip?.includes("faculty")) {
    await core.jobService.performFacultySynchronizationJob()
  }

  if (!skip?.includes("subject")) {
    await core.jobService.performSubjectSynchronizationJob()
  }

  if (!skip?.includes("grade")) {
    await core.jobService.performGradeSynchronizationJob()
  }

  res.status(200).send({})
}
