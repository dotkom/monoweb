import { trpc } from "../../../utils/trpc";
import { type EventId } from "@dotkomonline/types";

export const useEventGetQuery = (id: EventId) => {
    const { data: event, ...query } = trpc.event.get.useQuery(id);

    return { event, ...query };
};
