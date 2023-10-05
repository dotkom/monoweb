import {
    createCheckboxInput,
    createDateTimeInput,
    createSelectInput,
    createTextareaInput,
    createTextInput,
    useFormBuilder,
} from "../../form";
import { type EventWrite, EventWriteSchema } from "@dotkomonline/types";
import { useCommitteeAllQuery } from "../../../modules/committee/queries/use-committee-all-query";

const EVENT_FORM_DEFAULT_VALUES: Partial<EventWrite> = {
    start: new Date(),
    end: new Date(),
    description: "Mer informasjon og påmelding kommer når arrangementet nærmer seg!",
    imageUrl: null,
    location: null,
    subtitle: null,
    waitlist: null,
    committeeId: null,
};

interface UseEventWriteFormProps {
    onSubmit(data: EventWrite): void;
    defaultValues?: Partial<EventWrite>;
    label?: string;
}

export const useEventWriteForm = ({
    onSubmit,
    label = "Opprett arrangement",
    defaultValues = EVENT_FORM_DEFAULT_VALUES,
}: UseEventWriteFormProps) => {
    const { committees } = useCommitteeAllQuery();

    return useFormBuilder({
        schema: EventWriteSchema,
        defaultValues,
        onSubmit,
        label,
        fields: {
            title: createTextInput({
                label: "Arrangementnavn",
                placeholder: "Åre 2024",
                withAsterisk: true,
            }),
            subtitle: createTextInput({
                label: "Ingress",
                placeholder:
                    "Tidspunktet for Åreturen 2023 er endelig satt, og det er bare å gjøre seg klar for ÅREts høydepunkt!!",
            }),
            description: createTextareaInput({
                label: "Beskrivelse",
                placeholder: "Mer informasjon og påmelding kommer når arrangementet nærmer seg!",
            }),
            location: createTextInput({
                label: "Sted",
                placeholder: "Åre",
            }),
            imageUrl: createTextInput({
                label: "Bildelenke",
            }),
            start: createDateTimeInput({
                label: "Starttidspunkt",
                withAsterisk: true,
            }),
            end: createDateTimeInput({
                label: "Sluttidspunkt",
                withAsterisk: true,
            }),
            committeeId: createSelectInput({
                label: "Arrangør",
                placeholder: "Arrkom",
                data: committees.map((committee) => ({ value: committee.id, label: committee.name })),
            }),
            status: createSelectInput({
                label: "Event status",
                placeholder: "Velg en",
                data: [
                    { value: "TBA", label: "TBA" },
                    { value: "PUBLIC", label: "Public" },
                    { value: "NO_LIMIT", label: "No Limit" },
                    { value: "ATTENDANCE", label: "Attendance" },
                ],
                withAsterisk: true,
            }),
            type: createSelectInput({
                label: "Type",
                placeholder: "Velg en",
                data: [
                    { value: "SOCIAL", label: "Sosialt" },
                    { value: "COMPANY", label: "Bedriftsarrangement" },
                ],
                withAsterisk: true,
            }),
            public: createCheckboxInput({
                label: "Offentlig arrangement",
            }),
        },
    });
};
