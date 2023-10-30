import { type Committee } from "@dotkomonline/types"
import { z } from "zod"
import { EventSchema } from "../../../../../../packages/types/src/event"
import {
  createCheckboxInput,
  createDateTimeInput,
  createMultipleSelectInput,
  createSelectInput,
  createTextInput,
  createTextareaInput,
  useFormBuilder,
} from "../../form"

interface UseEventEditFormProps {
  onSubmit: (data: FormValidationResult) => void
  defaultValues?: Partial<FormValidationResult>
  label?: string
  committees: Committee[]
}

const FormValidationSchema = EventSchema.extend({
  committeeIds: z.array(z.string()),
})
  .required({ id: true })
  .refine(
    (data) => data.start < data.end,
    {
      message: "Sluttidspunkt må være etter starttidspunkt",
      path: ["end"],
    }
  )

type FormValidationResult = z.infer<typeof FormValidationSchema>

export const useEventEditForm = ({
  committees,
  onSubmit,
  label = "Opprett arrangement",
  defaultValues,
}: UseEventEditFormProps) => useFormBuilder({
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
        rows: 20,
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
