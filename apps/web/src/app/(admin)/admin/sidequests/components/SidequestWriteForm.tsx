"use client"

import { DateTimePickerField } from "@admin/components/forms/DateTimePickerField"
import { Form } from "@admin/components/forms/Form"
import { ImageUploadModalField } from "@admin/components/forms/ImageUploadModalField"
import { RichTextField } from "@admin/components/forms/RichTextField"
import { TextField } from "@admin/components/forms/TextField"
import {
  SIDEQUEST_IMAGE_MAX_SIZE_KIB,
  RequestedSidequestWriteSchema,
  SidequestStatusSchema,
} from "@dotkomonline/rpc/sidequest"
import { Button } from "@dotkomonline/ui"
import { getCurrentUTC } from "@dotkomonline/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { addDays, addHours, isAfter, setHours, setMilliseconds, setMinutes, setSeconds } from "date-fns"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { SelectField, type SelectFieldOption } from "../../components/forms/SelectField"

export const SidequestWriteFormSchema = RequestedSidequestWriteSchema.extend({
  interestGroupId: z.string().min(1, "Interessegruppe er påkrevd"),
  imageUrl: z.string().nullable(),
  status: z.enum([SidequestStatusSchema.enum.IN_REVIEW, SidequestStatusSchema.enum.PUBLISHED]),
  title: z.string().trim().min(1, "Tittel er påkrevd"),
  description: z.string().trim().min(1, "Beskrivelse er påkrevd"),
  capacity: z.int().min(1, "Kapasitet kan ikke være mindre enn 1").nullable(),
}).superRefine((data, ctx) => {
  if (!isAfter(data.end, data.start)) {
    ctx.addIssue({
      code: "custom",
      message: "Sluttidspunkt må være etter starttidspunkt",
      path: ["end"],
    })
  }

  if (data.registerEnd !== null && isAfter(data.registerEnd, data.start)) {
    ctx.addIssue({
      code: "custom",
      message: "Påmeldingsfristen må være før Sidequest starter",
      path: ["registerEnd"],
    })
  }

  if (data.deregisterDeadline !== null && isAfter(data.deregisterDeadline, data.start)) {
    ctx.addIssue({
      code: "custom",
      message: "Avmeldingsfristen må være før Sidequest starter",
      path: ["deregisterDeadline"],
    })
  }
})
export type SidequestWriteFormData = z.infer<typeof SidequestWriteFormSchema>

const tomorrowAt12 = setMilliseconds(setSeconds(setMinutes(setHours(addDays(getCurrentUTC(), 1), 12), 0), 0), 0)

export const SIDEQUEST_WRITE_FORM_DEFAULT_VALUES = {
  title: "",
  description: "",
  start: tomorrowAt12,
  end: addHours(tomorrowAt12, 3),
  registerEnd: null,
  deregisterDeadline: null,
  imageUrl: null,
  locationTitle: null,
  locationAddress: null,
  locationLink: null,
  interestGroupId: "",
  status: SidequestStatusSchema.enum.PUBLISHED,
  capacity: null,
} as const satisfies SidequestWriteFormData

interface SidequestWriteFormProps {
  defaultValues: SidequestWriteFormData
  onSubmit: (data: SidequestWriteFormData) => void
  onFileUpload: (file: File) => Promise<string>
  disabled?: boolean
  submitLabel?: string
  canSetStatus?: boolean
  canSelectInterestGroup?: boolean
  interestGroupOptions?: SelectFieldOption<string>[]
}

export const SidequestWriteForm = ({
  defaultValues,
  onSubmit,
  onFileUpload,
  disabled,
  submitLabel = "Opprett Sidequest",
  canSetStatus = false,
  canSelectInterestGroup = false,
  interestGroupOptions = [],
}: SidequestWriteFormProps) => {
  const form = useForm<SidequestWriteFormData>({
    resolver: zodResolver(SidequestWriteFormSchema),
    defaultValues,
    disabled,
  })

  return (
    <Form form={form} onSubmit={onSubmit}>
      {canSelectInterestGroup && (
        <SelectField
          control={form.control}
          name="interestGroupId"
          label="Interessegruppe"
          placeholder="Velg interessegruppe"
          options={interestGroupOptions}
          required
        />
      )}

      <TextField control={form.control} name="title" label="Tittel" placeholder="Klatring i Klatreverket" required />
      <RichTextField control={form.control} name="description" label="Beskrivelse" required />
      <DateTimePickerField control={form.control} name="start" label="Start" required syncOffsetTo="end" />
      <DateTimePickerField control={form.control} name="end" label="Slutt" required />
      <DateTimePickerField
        control={form.control}
        name="registerEnd"
        label="Påmeldingsfrist"
        description="La feltet stå tomt hvis påmeldingen skal være åpen til Sidequest starter"
      />
      <DateTimePickerField
        control={form.control}
        name="deregisterDeadline"
        label="Avmeldingsfrist"
        description="La feltet stå tomt hvis man kan melde seg av frem til start"
      />

      <TextField
        control={form.control}
        name="capacity"
        label="Kapasitet"
        type="number"
        min={1}
        placeholder="Ubegrenset"
        description="La feltet stå tomt for ubegrenset kapasitet"
        onChange={(event) => {
          const next = event.target.valueAsNumber
          form.setValue("capacity", Number.isNaN(next) ? null : next, { shouldValidate: true })
        }}
      />

      <ImageUploadModalField
        control={form.control}
        name="imageUrl"
        label="Bilde"
        description="Bildet bør passe sideforholdet 16:9."
        onFileUpload={onFileUpload}
        maxSizeKiB={SIDEQUEST_IMAGE_MAX_SIZE_KIB}
      />
      <TextField control={form.control} name="locationTitle" label="Stedsnavn" placeholder="Klatreverket" />
      <TextField
        control={form.control}
        name="locationAddress"
        label="Stedsadresse"
        placeholder="Innherredsveien 7, Trondheim"
      />
      <TextField control={form.control} name="locationLink" label="Stedslenke" placeholder="https://..." />

      {canSetStatus && (
        <SelectField
          control={form.control}
          name="status"
          label="Status"
          options={[
            { label: "Ikke publisert", value: SidequestStatusSchema.enum.IN_REVIEW },
            { label: "Publisert", value: SidequestStatusSchema.enum.PUBLISHED },
          ]}
          required
        />
      )}

      <Button type="submit" variant="default" className="w-fit" disabled={form.formState.disabled}>
        {submitLabel}
      </Button>
    </Form>
  )
}
