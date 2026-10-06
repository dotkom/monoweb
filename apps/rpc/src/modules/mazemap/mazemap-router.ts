import type { inferProcedureInput, inferProcedureOutput } from "@trpc/server"
import { z } from "zod"
import { isCommitteeMember } from "../../authorization"
import { withAuthentication, withAuthorization } from "../../middlewares"
import { procedure, t } from "../../trpc"
import { MazemapRoomSchema } from "./mazemap"
import { searchMazemapRooms } from "./mazemap-search"

export type SearchMazemapRoomsInput = inferProcedureInput<typeof searchRoomsProcedure>
export type SearchMazemapRoomsOutput = inferProcedureOutput<typeof searchRoomsProcedure>
const searchRoomsProcedure = procedure
  .input(z.object({ query: z.string().max(200) }))
  .output(MazemapRoomSchema.array())
  .use(withAuthentication())
  .use(withAuthorization(isCommitteeMember()))
  .query(async ({ input }) => {
    return searchMazemapRooms(input.query)
  })

export const mazemapRouter = t.router({
  searchRooms: searchRoomsProcedure,
})
