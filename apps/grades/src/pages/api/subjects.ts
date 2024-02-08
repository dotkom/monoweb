import { type NextApiRequest, type NextApiResponse } from "next"
import { z } from "zod"
import { createKysely } from "@/server/kysely"
import { createServiceLayer } from "@/server/core"

const QuerySchema = z.object({
  q: z.string().nullish().default(null),
  take: z.number().int().positive().default(30),
  skip: z.number().int().nonnegative().default(0),
})

export default async function route(req: NextApiRequest, res: NextApiResponse) {
  const query = QuerySchema.parse(req.query)
  const kysely = await createKysely()
  const core = createServiceLayer({ fetch, db: kysely })

  const subjects = await core.subjectService.search(query.q, query.take, query.skip)
  res.status(200).json(subjects)
}
