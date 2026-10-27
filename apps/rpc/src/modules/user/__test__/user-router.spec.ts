import type { TRPCContext } from "../../../trpc"
import type { DBHandle } from "@dotkomonline/db"
import { CommitteeGroupSlug } from "../../authorization-service"
import { GroupRoleTypeEnum } from "../../group/group"
import { userRouter } from "../user-router"

describe("sendBugReportEmail", () => {
  const report = { title: "Påmelding feiler", body: "Jeg får ikke meldt meg på." }

  function createContext(authenticated: boolean) {
    const handle = {} as DBHandle
    const userService = { sendBugReportEmail: vi.fn().mockResolvedValue(undefined) }
    const transaction = vi.fn(async (callback: (handle: DBHandle) => Promise<unknown>) => callback(handle))
    const context = {
      principal: authenticated ? { subject: "user-1" } : null,
      userService,
      prisma: { $transaction: transaction },
    } as unknown as TRPCContext

    return { context, handle, userService, transaction }
  }

  it("rejects anonymous requests before opening a transaction or sending email", async () => {
    const { context, userService, transaction } = createContext(false)

    await expect(userRouter.createCaller(context).sendBugReportEmail(report)).rejects.toMatchObject({
      code: "UNAUTHORIZED",
    })
    expect(transaction).not.toHaveBeenCalled()
    expect(userService.sendBugReportEmail).not.toHaveBeenCalled()
  })

  it("uses the authenticated subject and strips supplied identity fields", async () => {
    const { context, handle, userService } = createContext(true)

    await userRouter.createCaller(context).sendBugReportEmail({
      ...report,
      email: "someone-else@example.com",
      name: "Someone Else",
    } as typeof report)

    expect(userService.sendBugReportEmail).toHaveBeenCalledWith(handle, "user-1", report)
  })

  it("reports email failures to the caller", async () => {
    const { context, userService } = createContext(true)
    userService.sendBugReportEmail.mockRejectedValue(new Error("Queue unavailable"))

    await expect(userRouter.createCaller(context).sendBugReportEmail(report)).rejects.toThrow("Queue unavailable")
  })
})

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
