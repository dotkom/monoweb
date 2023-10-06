import { trpc } from "../../../utils/trpc";

export const useCommitteeAllQuery = () => {
  const { data: committees = [], ...query } = trpc.committee.all.useQuery({ take: 999 });

  return { committees, ...query };
};
