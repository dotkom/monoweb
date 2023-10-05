import { trpc } from "../../../utils/trpc";

export const useCompanyAllQuery = () => {
    const { data: companies = [], ...query } = trpc.company.all.useQuery({ take: 999 });

    return { companies, ...query };
};
