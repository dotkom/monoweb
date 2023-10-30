import { trpc } from "../../../utils/trpc"
import { MarkId } from "@dotkomonline/types"

export const usePersonalMarkGetByMarkId = (markId: MarkId) => {
  const { data: personalMarks = [], ...query } = trpc.mark.getByMark.useQuery({
    id: markId,
  })
  return { personalMarks, ...query }
}
