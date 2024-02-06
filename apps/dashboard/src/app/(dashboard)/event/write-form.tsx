import { EventWriteSchema } from "@dotkomonline/types"
import { z } from "zod"
import { useCommitteeAllQuery } from "../../../modules/committee/queries/use-committee-all-query"
import {
  createCheckboxInput,
  createDateTimeInput,
  createMultipleSelectInput,
  createSelectInput,
  createTextInput,
  createTextareaInput,
  useFormBuilder,
} from "../../form"

const EVENT_FORM_DEFAULT_VALUES: Partial<FormValidationResult> = {
  start: new Date(),
  end: new Date(),
  description: "Mer informasjon og påmelding kommer når arrangementet nærmer seg!",
  imageUrl: null,
  location: null,
  subtitle: null,
  waitlist: null,
  committeeIds: [],
}

interface UseEventWriteFormProps {
  onSubmit(data: z.infer<typeof FormValidationSchema>): void
  defaultValues?: Partial<FormValidationResult>
  label?: string
}

export const FormValidationSchema = EventWriteSchema.extend({
  start: z.date().min(new Date(), { message: "Starttidspunkt må være i fremtiden" }),
  end: z.date().min(new Date(), { message: "Sluttidspunkt må være i fremtiden" }),
  committeeIds: z.array(z.string()),
})
  .partial({
    id: true,
  })
  .refine((data) => data.start < data.end, {
    message: "Sluttidspunkt må være etter starttidspunkt",
    path: ["end"],
  })

type FormValidationResult = z.infer<typeof FormValidationSchema>

export const useEventWriteForm = ({
  onSubmit,
  label = "Opprett arrangement",
  defaultValues = EVENT_FORM_DEFAULT_VALUES,
}: UseEventWriteFormProps) => {
  const { committees } = useCommitteeAllQuery()
  return useFormBuilder({
    schema: FormValidationSchema,
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
      committeeIds: createMultipleSelectInput({
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
  })
}
