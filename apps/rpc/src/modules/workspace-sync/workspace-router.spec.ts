import type { ServiceLayer } from "../core"
import { CommitteeGroupSlug } from "../authorization-service"
import { createTrpcContext } from "../../trpc"
import { workspaceRouter } from "./workspace-router"

describe("create workspace user authorization", () => {
  it("rejects self-service creation for a committee the caller has not joined", async () => {
    const context = await createTrpcContext(
      {
        subject: "user-1",
        affiliations: new Map(),
        scopes: new Set(),
      },
      {} as ServiceLayer
    )
    const caller = workspaceRouter.createCaller(context)

    await expect(
      caller.createUser({
        userId: "user-1",
        contactCommittee: CommitteeGroupSlug.DOTKOM,
      })
    ).rejects.toMatchObject({ code: "FORBIDDEN" })
  })
})
