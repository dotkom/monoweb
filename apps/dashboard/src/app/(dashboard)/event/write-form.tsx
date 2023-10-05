import { type EventWrite, EventWriteSchema } from "@dotkomonline/types";

import { useCommitteeAllQuery } from "../../../modules/committee/queries/use-committee-all-query";
import {
    createCheckboxInput,
    createDateTimeInput,
    createSelectInput,
    createTextInput,
    createTextareaInput,
    useFormBuilder,
} from "../../form";

const EVENT_FORM_DEFAULT_VALUES: Partial<EventWrite> = {
    committeeId: null,
    description: "Mer informasjon og påmelding kommer når arrangementet nærmer seg!",
    end: new Date(),
    imageUrl: null,
    location: null,
    start: new Date(),
    subtitle: null,
    waitlist: null,
};

interface UseEventWriteFormProps {
    defaultValues?: Partial<EventWrite>;
    label?: string;
    onSubmit(data: EventWrite): void;
}

export const useEventWriteForm = ({
    defaultValues = EVENT_FORM_DEFAULT_VALUES,
    label = "Opprett arrangement",
    onSubmit,
}: UseEventWriteFormProps) => {
    const { committees } = useCommitteeAllQuery();

    return useFormBuilder({
        defaultValues,
        fields: {
            committeeId: createSelectInput({
                data: committees.map((committee) => ({ label: committee.name, value: committee.id })),
                label: "Arrangør",
                placeholder: "Arrkom",
            }),
            description: createTextareaInput({
                label: "Beskrivelse",
                placeholder: "Mer informasjon og påmelding kommer når arrangementet nærmer seg!",
            }),
            end: createDateTimeInput({
                label: "Sluttidspunkt",
                withAsterisk: true,
            }),
            imageUrl: createTextInput({
                label: "Bildelenke",
            }),
            location: createTextInput({
                label: "Sted",
                placeholder: "Åre",
            }),
            public: createCheckboxInput({
                label: "Offentlig arrangement",
            }),
            start: createDateTimeInput({
                label: "Starttidspunkt",
                withAsterisk: true,
            }),
            status: createSelectInput({
                data: [
                    { label: "TBA", value: "TBA" },
                    { label: "Public", value: "PUBLIC" },
                    { label: "No Limit", value: "NO_LIMIT" },
                    { label: "Attendance", value: "ATTENDANCE" },
                ],
                label: "Event status",
                placeholder: "Velg en",
                withAsterisk: true,
            }),
            subtitle: createTextInput({
                label: "Ingress",
                placeholder:
                    "Tidspunktet for Åreturen 2023 er endelig satt, og det er bare å gjøre seg klar for ÅREts høydepunkt!!",
            }),
            title: createTextInput({
                label: "Arrangementnavn",
                placeholder: "Åre 2024",
                withAsterisk: true,
            }),
            type: createSelectInput({
                data: [
                    { label: "Sosialt", value: "SOCIAL" },
                    { label: "Bedriftsarrangement", value: "COMPANY" },
                ],
                label: "Type",
                placeholder: "Velg en",
                withAsterisk: true,
            }),
        },
        label,
        onSubmit,
        schema: EventWriteSchema,
    });
};
