import { type EventId } from "@dotkomonline/types";

import { trpc } from "../../../utils/trpc";

export const useEventGetQuery = (id: EventId) => {
    const { data: event, ...query } = trpc.event.get.useQuery(id);

    return { event, ...query };
};
