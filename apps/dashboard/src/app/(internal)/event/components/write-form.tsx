import { useGroupAllQuery } from "@/app/(internal)/group/queries"
import { createDateTimeInput } from "@/components/forms/DateTimeInput"
import { createEventSelectInput } from "@/components/forms/EventSelectInput"
import { useFormBuilder } from "@/components/forms/Form"
import { createImageInput } from "@/components/forms/ImageInput"
import { createMultipleSelectInput } from "@/components/forms/MultiSelectInput"
import { createRichTextInput } from "@/components/forms/RichTextInput"
import { createSelectInput } from "@/components/forms/SelectInput"
import { createTextInput } from "@/components/forms/TextInput"
import {
  EventSchema,
  type EventStatus,
  EventTypeSchema,
  EventWriteSchema,
  mapEventTypeToLabel,
} from "@dotkomonline/types"
import { addHours, roundToNearestHours } from "date-fns"
import { z } from "zod"
import { validateEventWrite } from "../validation"

const EVENT_FORM_DATA_TYPE = Object.values(EventTypeSchema.Values).map((type) => ({
  value: type,
  label: mapEventTypeToLabel(type),
}))

const EVENT_FORM_DATA_STATUS = [
  { value: "DRAFT", label: "Utkast" },
  { value: "PUBLIC", label: "Publisert" },
] as const satisfies { value: Omit<EventStatus, "DELETED">; label: string }[]

const FormValidationSchema = EventWriteSchema.extend({
  hostingGroupIds: z.array(z.string()),
  parentId: EventSchema.shape.id.nullable(),
}).superRefine((data, ctx) => {
  const issues = validateEventWrite(data)
  for (const issue of issues) {
    ctx.addIssue(issue)
  }
})

type FormValidationResult = z.infer<typeof FormValidationSchema>

const nextHour = roundToNearestHours(new Date(), { roundingMethod: "ceil" })

const DEFAULT_VALUES = {
  start: nextHour,
  end: addHours(nextHour, 1),
  status: "PUBLIC",
  type: "SOCIAL",

  title: "",
  subtitle: null,
  description: "",
  locationTitle: null,
  locationAddress: null,
  locationLink: null,
  imageUrl: null,
  hostingGroupIds: [],
  parentId: null,
} as const satisfies FormValidationResult

interface UseEventWriteFormProps {
  onSubmit(data: FormValidationResult): void
}

export const useEventWriteForm = ({ onSubmit }: UseEventWriteFormProps) => {
  const { groups } = useGroupAllQuery()
  return useFormBuilder({
    schema: FormValidationSchema,
    defaultValues: DEFAULT_VALUES,
    onSubmit,
    label: "Opprett arrangement",
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
        data: groups.map((group) => ({ value: group.slug, label: group.abbreviation })),
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
      }),
    },
  })
}
