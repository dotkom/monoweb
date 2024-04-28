import { type Committee, EventSchema } from "@dotkomonline/types"
import { z } from "zod"
import {
  createCheckboxInput,
  createDateTimeInput,
  createMultipleSelectInput,
  createSelectInput,
  createTextInput,
  createTextareaInput,
  useFormBuilder,
} from "../../form"
import { validateEvent } from "./event-form-validation"

interface UseEventEditFormProps {
  onSubmit(data: FormValidationResult): void
  defaultValues?: Partial<FormValidationResult>
  label?: string
  committees: Committee[]
}

type FormValidationResult = z.infer<typeof FormValidationSchema>

const FormValidationSchema = EventSchema.extend({
  committeeIds: z.array(z.string()),
}).superRefine((data, ctx) => {
  const issues = validateEvent(data)
  for (const issue of issues) {
    ctx.addIssue(issue)
  }
})

export const useEventEditForm = ({
  committees,
  onSubmit,
  label = "Opprett arrangement",
  defaultValues,
}: UseEventEditFormProps) =>
  useFormBuilder({
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
      locationTitle: createTextInput({
        label: "Tittel på lokasjon",
        placeholder: "Åre",
      }),
      locationAddress: createTextInput({
        label: "Adresse",
        placeholder: "Høgskoleringen 1, 7034 Trondheim",
      }),
      locationLink: createTextInput({
        label: "Lenke til kart",
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
