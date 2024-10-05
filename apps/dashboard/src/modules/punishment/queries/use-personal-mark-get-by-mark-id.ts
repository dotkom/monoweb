import type { MarkId } from "@dotkomonline/types"
import { trpc } from "../../../trpc"

export const usePersonalMarkGetByMarkId = (markId: MarkId) => {
  const { data: personalMarks = [], ...query } = trpc.personalMark.getByMark.useQuery({
    id: markId,
  })
  return { personalMarks, ...query }
}
