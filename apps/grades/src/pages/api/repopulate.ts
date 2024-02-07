import { type NextApiRequest, type NextApiResponse } from "next"
import { createKysely } from "@/server/kysely"
import { createServiceLayer } from "@/server/core"

export default async function route(req: NextApiRequest, res: NextApiResponse) {
  const kysely = await createKysely()
  const core = createServiceLayer({ fetch, db: kysely })

  const departments = await core.hkdirService.getDepartments("1150")

  for (const department of departments) {
    const faculty = await core.facultyRepository.getFacultyByReferenceId(department.Fakultetskode)
    if (faculty !== null) {
      continue
    }
    await core.facultyRepository.createFaculty({
      refId: department.Fakultetskode,
      name: department.Fakultetsnavn,
    })
  }

  res.status(200).send({})
}
