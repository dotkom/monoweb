import { type EventId } from "@dotkomonline/types";

import { trpc } from "../../../utils/trpc";

export const useEventCompanyGetQuery = (id: EventId) => {
    const { data: eventCompanies = [], ...query } = trpc.event.company.get.useQuery({
        id,
    });

    return { eventCompanies, ...query };
};
