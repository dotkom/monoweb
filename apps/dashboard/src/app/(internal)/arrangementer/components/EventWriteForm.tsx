"use client"

import { useGroupAllQuery } from "@/app/(internal)/grupper/queries"
import { useContestFindManyQuery } from "@/app/(internal)/konkurranser/queries"
import { CompanySelectField } from "@/components/forms/CompanySelectField"
import { DateTimePickerField } from "@/components/forms/DateTimePickerField"
import { Form } from "@/components/forms/Form"
import { ImageUploadModalField } from "@/components/forms/ImageUploadModalField"
import { MultiSelectField } from "@/components/forms/MultiSelectField"
import { RichTextField } from "@/components/forms/RichTextField"
import { SelectField } from "@/components/forms/SelectField"
import { TextField } from "@/components/forms/TextField"
import {
  EVENT_IMAGE_MAX_SIZE_KIB,
  type EventStatus,
  EventTypeSchema,
  EventWriteSchema,
  mapEventTypeToLabel,
} from "@dotkomonline/rpc/event"
import { getGroupDisplayName } from "@dotkomonline/rpc/group"
import { Button } from "@dotkomonline/ui"
import { zodResolver } from "@hookform/resolvers/zod"
import { addDays, addHours, setHours, setMilliseconds, setMinutes, setSeconds } from "date-fns"
import { useForm, type UseFormReturn } from "react-hook-form"
import { z } from "zod"
import { useEventFileUploadMutation } from "../mutations"
import { validateEventOrganizers, validateEventWrite } from "../validation"

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
}).superRefine((data, ctx) => {
  const issues = [...validateEventWrite(data), ...validateEventOrganizers(data.hostingGroupIds)]
  for (const issue of issues) {
    ctx.addIssue({ code: "custom", message: issue.message, path: issue.path })
  }
})

type EventWriteFormInput = z.input<typeof FormValidationSchema>
export type EventWriteFormValues = z.output<typeof FormValidationSchema>

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
  contestId: null,
  markForMissedAttendance: true,
} as const satisfies EventWriteFormValues

interface EventWriteFormProps {
  onSubmit(data: EventWriteFormValues): void
  disabled?: boolean
  submitLabel?: string
}

export function EventWriteForm({ onSubmit, disabled, submitLabel = "Opprett arrangement" }: EventWriteFormProps) {
  const { groups } = useGroupAllQuery()
  const { contests } = useContestFindManyQuery()
  const uploadFile = useEventFileUploadMutation()

  const form = useForm<EventWriteFormInput, unknown, EventWriteFormValues>({
    resolver: zodResolver(FormValidationSchema),
    defaultValues: DEFAULT_VALUES,
    disabled,
  })

  const resolvedForm = form as UseFormReturn<EventWriteFormValues>
  const { control } = resolvedForm

  return (
    <Form form={resolvedForm} onSubmit={onSubmit}>
      <TextField control={control} name="title" label="Arrangementnavn" placeholder="Silent Disco" required />
      <RichTextField control={control} name="description" label="Beskrivelse" required onFileUpload={uploadFile} />
      <TextField
        control={control}
        name="locationTitle"
        label="Stedsnavn"
        placeholder="Havet"
        description="Fritekst uten validering"
      />
      <TextField
        control={control}
        name="locationAddress"
        label="Stedsadresse"
        placeholder="Strandveien 104, 7067 Trondheim"
        description="Fritekst uten validering"
      />
      <TextField
        control={control}
        name="locationLink"
        label="Stedslenke"
        placeholder="https://..."
        description="Lenke til Google Maps eller MazeMap. Må være en gyldig lenke."
      />
      <ImageUploadModalField
        control={control}
        name="imageUrl"
        label="Bilde"
        maxSizeKiB={EVENT_IMAGE_MAX_SIZE_KIB}
        description="Bildet bør passe sideforholdene 24:9 (arrangementsiden) og 16:9 (alle andre sider)."
        onFileUpload={uploadFile}
        aspectRatio={{ width: 24, height: 9 }}
      />
      <DateTimePickerField control={control} name="start" label="Starttidspunkt" required syncOffsetTo="end" />
      <DateTimePickerField
        control={control}
        name="end"
        label="Sluttidspunkt"
        required
        description="Må være etter starttidspunktet"
      />
      <MultiSelectField
        control={control}
        name="hostingGroupIds"
        label="Arrangører"
        placeholder="Velg grupper"
        options={groups.map((group) => ({ value: group.slug, label: getGroupDisplayName(group) }))}
        required
      />
      <CompanySelectField control={control} name="companyIds" label="Bedrifter" placeholder="Velg bedrifter" />
      <SelectField<EventWriteFormValues, EventWriteFormValues["status"]>
        control={control}
        name="status"
        label="Status"
        placeholder="Velg status"
        options={[...EVENT_FORM_DATA_STATUS]}
        required
      />
      <SelectField<EventWriteFormValues, EventWriteFormValues["type"]>
        control={control}
        name="type"
        label="Type"
        placeholder="Velg type"
        options={EVENT_FORM_DATA_TYPE}
        required
      />
      <SelectField<EventWriteFormValues, string>
        control={control}
        name="contestId"
        label="Konkurranse"
        placeholder="Velg konkurranse"
        description="Knytt arrangementet til en konkurranse (valgfritt)"
        options={contests.map((contest) => ({ value: contest.id, label: contest.name }))}
      />

      <Button type="submit" variant="default" className="w-fit" disabled={form.formState.disabled}>
        {submitLabel}
      </Button>
    </Form>
  )
}
