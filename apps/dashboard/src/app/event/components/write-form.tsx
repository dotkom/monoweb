import { useGroupAllQuery } from "@/app/group/queries/use-group-all-query"
import { createDateTimeInput } from "@/components/forms/DateTimeInput"
import { useFormBuilder } from "@/components/forms/Form"
import { createImageInput } from "@/components/forms/ImageInput"
import { createMultipleSelectInput } from "@/components/forms/MultiSelectInput"
import { createRichTextInput } from "@/components/forms/RichTextInput"
import { createSelectInput } from "@/components/forms/SelectInput"
import { createTextInput } from "@/components/forms/TextInput"
import { EventWriteSchema } from "@dotkomonline/types"
import { z } from "zod"
import { validateEventWrite } from "../validation"

const EVENT_FORM_DEFAULT_VALUES: FormValidationResult = {
  start: new Date(),
  end: new Date(),
  description: "Mer informasjon og påmelding kommer når arrangementet nærmer seg!",
  imageUrl: null,
  locationAddress: null,
  subtitle: null,
  hostingGroupIds: [],
  status: "DRAFT",
  title: "",
  type: "SOCIAL",
  locationLink: null,
  locationTitle: "",
}

interface UseEventWriteFormProps {
  onSubmit(data: z.infer<typeof EventWriteFormValidationSchema>): void
}

export const EventWriteFormValidationSchema = EventWriteSchema.extend({
  hostingGroupIds: z.array(z.string()),
}).superRefine((data, ctx) => {
  const issues = validateEventWrite(data)
  for (const issue of issues) {
    ctx.addIssue(issue)
  }
})

type FormValidationResult = z.infer<typeof EventWriteFormValidationSchema>

export const useEventWriteForm = ({ onSubmit }: UseEventWriteFormProps) => {
  const { groups } = useGroupAllQuery()
  return useFormBuilder({
    schema: EventWriteFormValidationSchema,
    defaultValues: EVENT_FORM_DEFAULT_VALUES,
    onSubmit,
    label: "Opprett arrangement",
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
      description: createRichTextInput({
        label: "Beskrivelse",
        required: true,
      }),
      locationAddress: createTextInput({
        label: "Sted",
        placeholder: "Åre",
      }),
      imageUrl: createImageInput({
        label: "Bilde",
        placeholder: "Last opp",
      }),
      start: createDateTimeInput({
        label: "Starttidspunkt",
        withAsterisk: true,
      }),
      end: createDateTimeInput({
        label: "Sluttidspunkt",
        withAsterisk: true,
      }),
      hostingGroupIds: createMultipleSelectInput({
        label: "Arrangerende gruppe",
        placeholder: "Arrkom",
        data: groups.map((group) => ({ value: group.slug, label: group.abbreviation })),
        searchable: true,
      }),
      status: createSelectInput({
        label: "Event status",
        placeholder: "Velg en",
        data: [
          { value: "DRAFT", label: "Utkast" },
          { value: "PUBLIC", label: "Publisert" },
          { value: "DELETED", label: "Slettet" },
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
    },
  })
}
