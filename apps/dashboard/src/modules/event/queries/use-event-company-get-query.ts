import { trpc } from "../../../utils/trpc";
import { type EventId } from "@dotkomonline/types";

export const useEventCompanyGetQuery = (id: EventId) => {
    const { data: eventCompanies = [], ...query } = trpc.event.company.get.useQuery({
        id,
    });

    return { eventCompanies, ...query };
};
