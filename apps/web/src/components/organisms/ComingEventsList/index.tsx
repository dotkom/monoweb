import React from "react";
import { trpc } from "@/utils/trpc";
import { ComingEventListItem } from "../../../components/molecules/ComingEventListItem/ComingEventListItem";

export const ComingEventsList: React.FC = () => {
    const { data: events, isLoading } = trpc.event.all.useQuery();
    return (
        <ul className="w-full">
            {isLoading ? (
                <p>Loading...</p>
            ) : (
                events
                    ?.filter((event) => event.public)
                    .map((event) => (
                        <li key={event.id}>
                            <ComingEventListItem event={event} />
                        </li>
                    ))
            )}
        </ul>
    );
};
