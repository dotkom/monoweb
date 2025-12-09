import {
  type Company,
  EventSchema,
  type EventStatus,
  EventTypeSchema,
  type Group,
  mapEventTypeToLabel,
} from "@dotkomonline/types"
import { z } from "zod"
import { useEventFileUploadMutation } from "@/app/(internal)/event/mutations"
import { createCheckboxInput } from "@/components/forms/CheckboxInput"
import { createDateTimeInput } from "@/components/forms/DateTimeInput"
import { createEventSelectInput } from "@/components/forms/EventSelectInput"
import { useFormBuilder } from "@/components/forms/Form"
import { createImageInput } from "@/components/forms/ImageInput"
import { createMultipleSelectInput } from "@/components/forms/MultiSelectInput"
import { createRichTextInput } from "@/components/forms/RichTextInput/RichTextInput"
import { createSelectInput } from "@/components/forms/SelectInput"
import { createTextInput } from "@/components/forms/TextInput"
import { validateEventWrite } from "../validation"

const EVENT_FORM_DATA_TYPE = Object.values(EventTypeSchema.Values).map((type) => ({
  value: type,
  label: mapEventTypeToLabel(type),
}))

const EVENT_FORM_DATA_STATUS = [
  { value: "DRAFT", label: "Utkast" },
  { value: "PUBLIC", label: "Publisert" },
] as const satisfies { value: Omit<EventStatus, "DELETED">; label: string }[]

const FormValidationSchema = EventSchema.extend({
  hostingGroupIds: z.array(z.string()),
  companyIds: z.array(z.string()),
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
  companies: Company[]
}

export const useEventEditForm = ({
  hostingGroups,
  companies,
  onSubmit,
  label = "Oppdater arrangement",
  defaultValues,
}: UseEventEditFormProps) => {
  const uploadFile = useEventFileUploadMutation()

  return useFormBuilder({
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
      description: createRichTextInput({
        label: "Beskrivelse",
        required: true,
        onFileUpload: uploadFile,
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
        description: (
          <>
            Bildet bør passe sideforholdene <strong>24:9</strong> (arrangementsiden) og 16:9 (alle andre sider).
          </>
        ),
        onFileUpload: uploadFile,
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
      companyIds: createMultipleSelectInput({
        label: "Bedrifter",
        placeholder: "Velg bedrifter",
        data: companies.map((company) => ({ value: company.id, label: company.name })),
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
      parentId: createEventSelectInput({
        label: "Forelderarrangement",
        placeholder: "Søk etter arrangement...",
        clearable: true,
        excludeEventIds: defaultValues?.id ? [defaultValues.id] : [],
      }),
      markForMissedAttendance: createCheckboxInput({
        label: "Gi prikk for fravær",
      }),
    },
  })
}
