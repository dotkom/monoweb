"use client"

import { DateTimePickerField } from "@admin/components/forms/DateTimePickerField"
import { Form } from "@admin/components/forms/Form"
import { ImageUploadModalField } from "@admin/components/forms/ImageUploadModalField"
import { RichTextField } from "@admin/components/forms/RichTextField"
import { TextField } from "@admin/components/forms/TextField"
import { TextareaField } from "@admin/components/forms/TextareaField"
import { RequestedSidequestWriteSchema, SIDEQUEST_IMAGE_MAX_SIZE_KIB } from "@dotkomonline/rpc/sidequest"
import { Button, Collapsible, CollapsibleContent, CollapsibleTrigger, Text, Title } from "@dotkomonline/ui"
import { getCurrentUTC } from "@dotkomonline/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { IconChevronDown } from "@tabler/icons-react"
import { addDays, addHours, isAfter, setHours, setMilliseconds, setMinutes, setSeconds } from "date-fns"
import { useForm } from "react-hook-form"
import { z } from "zod"

const optionalPositiveIntString = (invalidMessage: string) =>
  z
    .string()
    .trim()
    .refine((value) => value === "" || (/^\d+$/.test(value) && Number(value) > 0), invalidMessage)

export const SidequestRequestWriteFormSchema = RequestedSidequestWriteSchema.extend({
  title: z.string().trim().min(1, "Tittel er påkrevd"),
  description: z.string().trim().min(1, "Beskrivelse er påkrevd"),
  capacity: z.int().min(1, "Kapasitet kan ikke være mindre enn 1").nullable(),
  imageUrl: z.string().nullable(),
  requestDescription: z.string(),
  requestedAmount: optionalPositiveIntString("Beløpet må være et positivt heltall i kroner"),
  expectedAttendeeCount: optionalPositiveIntString("Antallet må være et positivt heltall"),
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

export type SidequestRequestWriteFormValues = z.infer<typeof SidequestRequestWriteFormSchema>

const tomorrowAt12 = setMilliseconds(setSeconds(setMinutes(setHours(addDays(getCurrentUTC(), 1), 12), 0), 0), 0)

export const SIDEQUEST_REQUEST_WRITE_FORM_DEFAULT_VALUES = {
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
  capacity: null,
  requestDescription: "",
  requestedAmount: "",
  expectedAttendeeCount: "",
} as const satisfies SidequestRequestWriteFormValues

interface Props {
  defaultValues?: SidequestRequestWriteFormValues
  onSubmit: (values: SidequestRequestWriteFormValues) => void
  onFileUpload: (file: File) => Promise<string>
  disabled?: boolean
}

export const SidequestRequestWriteForm = ({ defaultValues, onSubmit, onFileUpload, disabled }: Props) => {
  const form = useForm<SidequestRequestWriteFormValues>({
    resolver: zodResolver(SidequestRequestWriteFormSchema),
    defaultValues: defaultValues ?? SIDEQUEST_REQUEST_WRITE_FORM_DEFAULT_VALUES,
    disabled,
  })

  const hasSupportRequest =
    (defaultValues?.requestedAmount != null && defaultValues.requestedAmount !== "") ||
    (defaultValues?.expectedAttendeeCount != null && defaultValues.expectedAttendeeCount !== "") ||
    (defaultValues?.requestDescription != null && defaultValues.requestDescription !== "")

  return (
    <Form form={form} onSubmit={onSubmit} className="flex flex-col gap-8">
      <section className="flex flex-col gap-6">
        <div className="flex flex-col">
          <Title element="h2" size="sm">
            Sidequest
          </Title>
          <Text className="text-sm text-muted-foreground">
            Feltene under blir Sidequest som publiseres når søknaden godkjennes.
          </Text>
        </div>
        <div className="flex flex-col gap-4">
          <TextField
            control={form.control}
            name="title"
            label="Tittel"
            placeholder="Klatring i Klatreverket"
            required
          />
          <RichTextField control={form.control} name="description" label="Beskrivelse" required />
          <DateTimePickerField
            control={form.control}
            name="start"
            label="Start"
            placeholder="Når starter det?"
            required
            syncOffsetTo="end"
          />
          <DateTimePickerField control={form.control} name="end" label="Slutt" required />
          <DateTimePickerField
            control={form.control}
            name="registerEnd"
            label="Påmeldingsfrist"
            placeholder="Når stenger påmeldingen?"
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
          <TextField control={form.control} name="locationTitle" label="Sted" placeholder="Klatreverket" />
          <TextField
            control={form.control}
            name="locationAddress"
            label="Adresse"
            placeholder="Innherredsveien 7, Trondheim"
          />
          <TextField control={form.control} name="locationLink" label="Kartlenke" placeholder="https://..." />
        </div>
      </section>

      <Collapsible defaultOpen={hasSupportRequest}>
        <section className="flex flex-col">
          <CollapsibleTrigger
            type="button"
            className="flex w-full items-center justify-between gap-3 rounded-lg text-left hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <div className="flex flex-col">
              <Title element="h2" size="sm">
                Søke om støtte
              </Title>
              <Text className="text-sm text-muted-foreground">Valgfritt</Text>
            </div>
            <IconChevronDown className="size-5 shrink-0 text-muted-foreground" />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="flex flex-col gap-4 pt-6">
              <Text className="text-sm text-muted-foreground">
                Vi fokuserer på støtte per person. Søker dere om 500 kroner fordi dere tror 10 personer møter opp, men
                kun 5 møter opp, får dere kun 250 kroner, med mindre det er god grunn til noe annet. På den andre siden,
                kommer det 12 personer, får dere fremdeles bare refundert 500 kroner, for at vi skal kunne ha et
                forutsigbart budsjett. Arrangerer man noe som er mer åpent, kan man bare søke om en sum.
              </Text>
              <TextField
                control={form.control}
                name="requestedAmount"
                label="Hvor mye søker dere om i støtte?"
                placeholder="500"
                type="number"
                min={1}
              />
              <TextField
                control={form.control}
                name="expectedAttendeeCount"
                label="Fordelt på hvor mange personer?"
                placeholder="10"
                type="number"
                min={1}
              />
              <TextareaField
                control={form.control}
                name="requestDescription"
                label="Tilleggsinformasjon"
                placeholder="Vi trenger utstyr til de som ikke har eget."
                description="Valgfritt. Skriv det Backlog trenger for å vurdere søknaden, som ikke allerede står i Sidequest."
              />
            </div>
          </CollapsibleContent>
        </section>
      </Collapsible>

      {!disabled && (
        <Button type="submit" variant="default" className="w-fit">
          Send søknad
        </Button>
      )}
    </Form>
  )
}
