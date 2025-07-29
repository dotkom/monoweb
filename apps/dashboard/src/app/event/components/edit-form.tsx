import { createDateTimeInput } from "@/components/forms/DateTimeInput"
import { useFormBuilder } from "@/components/forms/Form"
import { createImageInput } from "@/components/forms/ImageInput"
import { createMultipleSelectInput } from "@/components/forms/MultiSelectInput"
import { createRichTextInput } from "@/components/forms/RichTextInput"
import { createSelectInput } from "@/components/forms/SelectInput"
import { createTextInput } from "@/components/forms/TextInput"
import { EventSchema, type Group } from "@dotkomonline/types"
import { z } from "zod"
import { validateEventWrite } from "../validation"

interface UseEventEditFormProps {
  onSubmit(data: FormValidationResult): void
  defaultValues?: Partial<FormValidationResult>
  label?: string
  hostingGroups: Group[]
}

type FormValidationResult = z.infer<typeof FormValidationSchema>

const FormValidationSchema = EventSchema.extend({
  hostingGroupIds: z.array(z.string()),
}).superRefine((data, ctx) => {
  const issues = validateEventWrite(data)
  for (const issue of issues) {
    ctx.addIssue(issue)
  }
})

export const useEventEditForm = ({
  hostingGroups,
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
      description: createRichTextInput({
        label: "Beskrivelse",
        required: true,
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
        data: hostingGroups.map((group) => ({ value: group.slug, label: group.abbreviation })),
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
