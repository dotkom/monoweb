import { useEventFileUploadMutation } from "@/app/(internal)/arrangementer/mutations"
import { validateEventOrganizers, validateEventWrite } from "@/app/(internal)/arrangementer/validation"
import { useCompanyAllQuery } from "@/app/(internal)/bedrifter/queries"
import { useGroupAllQuery } from "@/app/(internal)/grupper/queries"
import { useContestFindManyQuery } from "@/app/(internal)/konkurranser/queries"
import { createDateTimeInput } from "@/components/forms/DateTimeInput"
import { createEventSelectInput } from "@/components/forms/EventSelectInput"
import { useFormBuilder } from "@/components/forms/Form"
import { createModalImageInput } from "@/components/forms/ImageInput"
import { createMultipleSelectInput } from "@/components/forms/MultiSelectInput"
import { createRichTextInput } from "@/components/forms/RichTextInput/RichTextInput"
import { createSelectInput } from "@/components/forms/SelectInput"
import { createTextInput } from "@/components/forms/TextInput"
import {
  EVENT_IMAGE_MAX_SIZE_KIB,
  EventSchema,
  type EventStatus,
  EventTypeSchema,
  EventWriteSchema,
  mapEventTypeToLabel,
} from "@dotkomonline/rpc/event"
import { addDays, addHours, setHours, setMilliseconds, setMinutes, setSeconds } from "date-fns"
import { z } from "zod"

const EVENT_FORM_DATA_TYPE = Object.values(EventTypeSchema.enum).map((type) => ({
  value: type,
  label: mapEventTypeToLabel(type),
}))

const EVENT_FORM_DATA_STATUS = [
  { value: "DRAFT", label: "Utkast" },
  { value: "PUBLIC", label: "Publisert" },
] as const satisfies { value: Omit<EventStatus, "DELETED">; label: string }[]

const FormValidationSchema = EventWriteSchema.extend({
  hostingGroupIds: z.array(z.string()),
  companyIds: z.array(z.string()),
  parentId: EventSchema.shape.id.nullable(),
}).superRefine((data, ctx) => {
  const issues = [...validateEventWrite(data), ...validateEventOrganizers(data.hostingGroupIds)]
  for (const issue of issues) {
    ctx.addIssue({ code: "custom", message: issue.message, path: issue.path })
  }
})

type FormValidationResult = z.infer<typeof FormValidationSchema>

const tomorrowAt16 = setMilliseconds(setSeconds(setMinutes(setHours(addDays(new Date(), 1), 16), 0), 0), 0)

const DEFAULT_VALUES = {
  start: tomorrowAt16,
  end: addHours(tomorrowAt16, 4),
  status: "PUBLIC",
  type: "SOCIAL",

  title: "",
  description: "",
  locationTitle: null,
  locationAddress: null,
  locationLink: null,
  imageUrl: null,
  hostingGroupIds: [],
  companyIds: [],
  parentId: null,
  contestId: null,
  markForMissedAttendance: true,
} as const satisfies FormValidationResult

interface UseEventWriteFormProps {
  onSubmit(data: FormValidationResult): void
  disabled?: boolean
}

export const useEventWriteForm = ({ onSubmit, disabled }: UseEventWriteFormProps) => {
  const { groups } = useGroupAllQuery()
  const { companies } = useCompanyAllQuery()
  const { contests } = useContestFindManyQuery()

  const uploadFile = useEventFileUploadMutation()

  return useFormBuilder({
    schema: FormValidationSchema,
    defaultValues: DEFAULT_VALUES,
    onSubmit,
    label: "Opprett arrangement",
    disabled,
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
      imageUrl: createModalImageInput({
        label: "Bilde",
        maxSizeKiB: EVENT_IMAGE_MAX_SIZE_KIB,
        description: (
          <>
            Bildet bør passe sideforholdene <strong>24:9</strong> (arrangementsiden) og 16:9 (alle andre sider).
          </>
        ),
        onFileUpload: uploadFile,
        aspectRatio: { width: 24, height: 9 },
      }),
      start: createDateTimeInput({
        label: "Starttidspunkt",
        withAsterisk: true,
        syncOffsetTo: "end",
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
        withAsterisk: true,
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
        excludeChildEvents: true,
      }),
      contestId: createSelectInput({
        label: "Konkurranse",
        placeholder: "Velg konkurranse",
        description: "Knytt arrangementet til en konkurranse (valgfritt)",
        data: contests.map((contest) => ({ value: contest.id, label: contest.name })),
        searchable: true,
        clearable: true,
      }),
    },
  })
}
