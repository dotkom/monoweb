import type { TRPCContext } from "../../../trpc"
import { CommitteeGroupSlug } from "../../authorization-service"
import { GroupRoleTypeEnum } from "../../group/group"
import { userRouter } from "../user-router"

describe("getAuthorization", () => {
  it("returns empty authorization for anonymous users", async () => {
    const authorizationService = {
      isAdministrator: vi.fn(),
      isCommitteeMember: vi.fn(),
    }

    const context = {
      principal: null,
      authorizationService,
    } as unknown as TRPCContext

    const caller = userRouter.createCaller(context)
    const result = await caller.getAuthorization()

    expect(result).toEqual({
      isAdministrator: false,
      isCommitteeMember: false,
      affiliations: {},
    })
    expect(authorizationService.isAdministrator).not.toHaveBeenCalled()
    expect(authorizationService.isCommitteeMember).not.toHaveBeenCalled()
  })

  it("returns authorization flags and serializable affiliations", async () => {
    const affiliations = new Map([[CommitteeGroupSlug.ARRKOM, new Set([GroupRoleTypeEnum.LEADER])]])
    const authorizationService = {
      isAdministrator: vi.fn().mockReturnValue(false),
      isCommitteeMember: vi.fn().mockReturnValue(true),
    }

    const context = {
      principal: {
        subject: "user-1",
        affiliations,
      },
      authorizationService,
    } as unknown as TRPCContext

    const caller = userRouter.createCaller(context)
    const result = await caller.getAuthorization()

    expect(result).toEqual({
      isAdministrator: false,
      isCommitteeMember: true,
      affiliations: {
        [CommitteeGroupSlug.ARRKOM]: [GroupRoleTypeEnum.LEADER],
      },
    })
    expect(authorizationService.isAdministrator).toHaveBeenCalledWith(affiliations)
    expect(authorizationService.isCommitteeMember).toHaveBeenCalledWith(affiliations)
  })
})
