import { type NextApiRequest, type NextApiResponse } from "next"
import { HkdirServiceImpl } from "@/trpc/hkdir-service"

export default async function route(req: NextApiRequest, res: NextApiResponse) {
  const service = new HkdirServiceImpl(fetch)
  const departments = await service.getDepartments("1150")

  res.json(departments)
}
