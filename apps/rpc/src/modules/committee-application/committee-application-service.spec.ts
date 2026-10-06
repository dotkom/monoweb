import type { DBHandle } from "@dotkomonline/db"
import { describe, expect, it } from "vitest"
import { mockDeep } from "vitest-mock-extended"
import { NotFoundError } from "../../error"
import type { CommitteeApplication } from "./committee-application"
import type { CommitteeApplicationRepository } from "./committee-application-repository"
import { getCommitteeApplicationService } from "./committee-application-service"

describe("CommitteeApplicationService", () => {
  const handle = mockDeep<DBHandle>()
  const committeeApplication: CommitteeApplication = {
    id: "application-id",
    createdAt: new Date(),
    updatedAt: new Date(),
    aboutMe: "I would like to join Dotkom",
    userId: "user-id",
    applicationPeriodId: "period-id",
  }

  it("distinguishes optional lookup from required lookup for a missing application", async () => {
    const repository = mockDeep<CommitteeApplicationRepository>()
    repository.findById.mockResolvedValue(null)
    const service = getCommitteeApplicationService(repository)

    await expect(service.findById(handle, committeeApplication.id)).resolves.toBeNull()
    await expect(service.getById(handle, committeeApplication.id)).rejects.toThrow(NotFoundError)
  })

  it("does not update a missing application", async () => {
    const repository = mockDeep<CommitteeApplicationRepository>()
    repository.findById.mockResolvedValue(null)
    const service = getCommitteeApplicationService(repository)

    await expect(service.update(handle, committeeApplication.id, { aboutMe: "Updated" })).rejects.toThrow(NotFoundError)
    expect(repository.update).not.toHaveBeenCalled()
  })

  it("does not delete a missing application", async () => {
    const repository = mockDeep<CommitteeApplicationRepository>()
    repository.findById.mockResolvedValue(null)
    const service = getCommitteeApplicationService(repository)

    await expect(service.delete(handle, committeeApplication.id)).rejects.toThrow(NotFoundError)
    expect(repository.delete).not.toHaveBeenCalled()
  })

  it("allows updates and deletion when the application exists", async () => {
    const repository = mockDeep<CommitteeApplicationRepository>()
    repository.findById.mockResolvedValue(committeeApplication)
    repository.update.mockResolvedValue({ ...committeeApplication, aboutMe: "Updated" })
    const service = getCommitteeApplicationService(repository)

    await expect(service.update(handle, committeeApplication.id, { aboutMe: "Updated" })).resolves.toEqual({
      ...committeeApplication,
      aboutMe: "Updated",
    })
    await service.delete(handle, committeeApplication.id)
    expect(repository.delete).toHaveBeenCalledWith(handle, committeeApplication.id)
  })

})
