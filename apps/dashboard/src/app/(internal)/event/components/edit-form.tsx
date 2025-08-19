import { createDateTimeInput } from "@/components/forms/DateTimeInput"
import { useFormBuilder } from "@/components/forms/Form"
import { createImageInput } from "@/components/forms/ImageInput"
import { createMultipleSelectInput } from "@/components/forms/MultiSelectInput"
import { createRichTextInput } from "@/components/forms/RichTextInput"
import { createSelectInput } from "@/components/forms/SelectInput"
import { createTextInput } from "@/components/forms/TextInput"
import { EventSchema, type EventStatus, type EventType, type Group } from "@dotkomonline/types"
import { z } from "zod"
import { validateEventWrite } from "../validation"

const EVENT_FORM_DATA_TYPE = [
  { value: "SOCIAL", label: "Sosialt" },
  { value: "COMPANY", label: "Bedpres" },
  { value: "ACADEMIC", label: "Kurs" },
  { value: "GENERAL_ASSEMBLY", label: "Generalforsamling" },
  { value: "INTERNAL", label: "Internt" },
  { value: "OTHER", label: "Annet" },
  { value: "WELCOME", label: "Fadderuke" },
] as const satisfies { value: EventType; label: string }[]

const EVENT_FORM_DATA_STATUS = [
  { value: "DRAFT", label: "Utkast" },
  { value: "PUBLIC", label: "Publisert" },
] as const satisfies { value: Omit<EventStatus, "DELETED">; label: string }[]

const FormValidationSchema = EventSchema.extend({
  hostingGroupIds: z.array(z.string()),
}).superRefine((data, ctx) => {
  const issues = validateEventWrite(data)
  for (const issue of issues) {
    ctx.addIssue(issue)
  }
})

type FormValidationResult = z.infer<typeof FormValidationSchema>

interface UseEventEditFormProps {
  onSubmit(data: FormValidationResult): void
  defaultValues?: Partial<FormValidationResult>
  label?: string
  hostingGroups: Group[]
}

export const useEventEditForm = ({
  hostingGroups,
  onSubmit,
  label = "Oppdater arrangement",
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
        placeholder: "Silent Disco",
        withAsterisk: true,
      }),
      subtitle: createTextInput({
        label: "Ledetekst",
        placeholder: "En uforglemmelig kveld med musikk og dans!",
      }),
      description: createRichTextInput({
        label: "Beskrivelse",
        required: true,
      }),
      locationTitle: createTextInput({
        label: "Stedsnavn",
        placeholder: "Havet",
        description: "Fritekst uten validering",
      }),
      locationAddress: createTextInput({
        label: "Stedsadresse",
        placeholder: "Strandveien 104, 7067 Trondheim",
        description: "Fritekst uten validering",
      }),
      locationLink: createTextInput({
        label: "Stedslenke",
        placeholder: "https://...",
        description: "Lenke til Google Maps eller MazeMap. Må være en gyldig lenke.",
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
        description: "Må være etter starttidspunktet",
      }),
      hostingGroupIds: createMultipleSelectInput({
        label: "Arrangører",
        placeholder: "Velg grupper",
        data: hostingGroups.map((group) => ({ value: group.slug, label: group.abbreviation })),
        searchable: true,
      }),
      status: createSelectInput({
        label: "Status",
        placeholder: "Velg status",
        data: EVENT_FORM_DATA_STATUS,
        withAsterisk: true,
      }),
      type: createSelectInput({
        label: "Type",
        placeholder: "Velg type",
        data: EVENT_FORM_DATA_TYPE,
        withAsterisk: true,
      }),
    },
  })
