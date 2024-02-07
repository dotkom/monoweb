import { type NextApiRequest, type NextApiResponse } from "next"
import { HkdirServiceImpl } from "@/server/hkdir-service"

export default async function route(req: NextApiRequest, res: NextApiResponse) {
  const service = new HkdirServiceImpl(fetch)
  const grades = await service.getSubjectGrades("1150")

  res.json(grades)
}
