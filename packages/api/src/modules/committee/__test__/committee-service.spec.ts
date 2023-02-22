import { Kysely } from "kysely"
import { initCommitteeRepository } from "../committee-repository"
import { initCommitteeService } from "../committee-service"
import { Committee } from "@dotkomonline/types"
import { randomUUID } from "crypto"
import { NotFoundError } from "../../../errors/errors"

describe("CommitteeService", () => {
  const db = vi.mocked(Kysely.prototype)
  const committeeRepository = initCommitteeRepository(db)
  const committeeService = initCommitteeService(committeeRepository)

  it("creates a new committee", async () => {
    const committee: Omit<Committee, "id"> = {
      name: "Dotkom",
      createdAt: new Date(),
    }
    const id = randomUUID()
    vi.spyOn(committeeRepository, "create").mockResolvedValueOnce({ id, ...committee })
    const created = await committeeService.create(committee)
    expect(created).toEqual({ id, ...committee })
    expect(committeeRepository.create).toHaveBeenCalledWith(committee)
  })

  it("does not find non-existent committees", async () => {
    const id = randomUUID()
    vi.spyOn(committeeRepository, "getCommitteeById").mockResolvedValueOnce(undefined)
    await expect(() => committeeService.getCommittee(id)).rejects.toThrowError(NotFoundError)
  })
})
