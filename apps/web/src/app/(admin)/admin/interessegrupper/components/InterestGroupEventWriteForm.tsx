"use client"

import { DateTimePickerField } from "@admin/components/forms/DateTimePickerField"
import { Form } from "@admin/components/forms/Form"
import { ImageUploadModalField } from "@admin/components/forms/ImageUploadModalField"
import { RichTextField } from "@admin/components/forms/RichTextField"
import { TextField } from "@admin/components/forms/TextField"
import {
  INTEREST_GROUP_EVENT_IMAGE_MAX_SIZE_KIB,
  RequestedInterestGroupEventWriteSchema,
} from "@dotkomonline/rpc/interest-group-event"
import { Button } from "@dotkomonline/ui"
import { getCurrentUTC } from "@dotkomonline/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { addDays, addHours, isAfter, setHours, setMilliseconds, setMinutes, setSeconds } from "date-fns"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { SelectField, type SelectFieldOption } from "../../components/forms/SelectField"

export const InterestGroupEventWriteFormSchema = RequestedInterestGroupEventWriteSchema.extend({
  interestGroupId: z.string().min(1, "Interessegruppe er påkrevd"),
  imageUrl: z.string().trim().min(1, "Bilde er påkrevd"),
  status: z.enum(["IN_REVIEW", "PUBLISHED"]),
  title: z.string().trim().min(1, "Tittel er påkrevd"),
  description: z.string().trim().min(1, "Beskrivelse er påkrevd"),
}).superRefine((data, ctx) => {
  if (!isAfter(data.end, data.start)) {
    ctx.addIssue({
      code: "custom",
      message: "Sluttidspunkt må være etter starttidspunkt",
      path: ["end"],
    })
  }
  if (isAfter(data.registerEnd, data.start)) {
    ctx.addIssue({
      code: "custom",
      message: "Påmeldingsfristen må være før arrangementet starter",
      path: ["registerEnd"],
    })
  }
  if (isAfter(data.deregisterDeadline, data.start)) {
    ctx.addIssue({
      code: "custom",
      message: "Avmeldingsfristen må være før arrangementet starter",
      path: ["deregisterDeadline"],
    })
  }
})
export type InterestGroupEventWriteFormData = z.infer<typeof InterestGroupEventWriteFormSchema>

const tomorrowAt12 = setMilliseconds(setSeconds(setMinutes(setHours(addDays(getCurrentUTC(), 1), 12), 0), 0), 0)

export const INTEREST_GROUP_EVENT_WRITE_FORM_DEFAULT_VALUES = {
  title: "",
  description: "",
  start: tomorrowAt12,
  end: addHours(tomorrowAt12, 3),
  registerEnd: tomorrowAt12,
  deregisterDeadline: tomorrowAt12,
  imageUrl: "",
  locationTitle: null,
  locationAddress: null,
  locationLink: null,
  interestGroupId: "",
  status: "PUBLISHED",
} as const satisfies InterestGroupEventWriteFormData

interface InterestGroupEventWriteFormProps {
  defaultValues: InterestGroupEventWriteFormData
  onSubmit: (data: InterestGroupEventWriteFormData) => void
  onFileUpload: (file: File) => Promise<string>
  disabled?: boolean
  submitLabel?: string
  canSetStatus?: boolean
  canSelectInterestGroup?: boolean
  interestGroupOptions?: SelectFieldOption<string>[]
}

export const InterestGroupEventWriteForm = ({
  defaultValues,
  onSubmit,
  onFileUpload,
  disabled,
  submitLabel = "Opprett arrangement",
  canSetStatus = false,
  canSelectInterestGroup = false,
  interestGroupOptions = [],
}: InterestGroupEventWriteFormProps) => {
  const form = useForm<InterestGroupEventWriteFormData>({
    resolver: zodResolver(InterestGroupEventWriteFormSchema),
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
      <DateTimePickerField control={form.control} name="registerEnd" label="Påmeldingsfrist" required />
      <DateTimePickerField control={form.control} name="deregisterDeadline" label="Avmeldingsfrist" required />

      <ImageUploadModalField
        control={form.control}
        name="imageUrl"
        label="Bilde"
        description="Bildet bør passe sideforholdet 16:9."
        onFileUpload={onFileUpload}
        maxSizeKiB={INTEREST_GROUP_EVENT_IMAGE_MAX_SIZE_KIB}
        required
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
            { label: "Ikke publisert", value: "IN_REVIEW" },
            { label: "Publisert", value: "PUBLISHED" },
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
