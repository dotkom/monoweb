import { type NextApiRequest, type NextApiResponse } from "next"
import { createKysely } from "@/server/kysely"
import { createServiceLayer } from "@/server/core"

export default async function route(req: NextApiRequest, res: NextApiResponse) {
  const kysely = await createKysely()
  const core = createServiceLayer({ fetch, db: kysely })

  await core.jobService.performFacultySynchronizationJob()
  res.status(200).send({})
}
