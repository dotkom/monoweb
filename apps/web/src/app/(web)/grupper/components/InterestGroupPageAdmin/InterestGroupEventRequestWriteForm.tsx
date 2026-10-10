"use client"

import { DateTimePickerField } from "@admin/components/forms/DateTimePickerField"
import { Form } from "@admin/components/forms/Form"
import { ImageUploadModalField } from "@admin/components/forms/ImageUploadModalField"
import { RichTextField } from "@admin/components/forms/RichTextField"
import { TextField } from "@admin/components/forms/TextField"
import { TextareaField } from "@admin/components/forms/TextareaField"
import {
  INTEREST_GROUP_EVENT_IMAGE_MAX_SIZE_KIB,
  RequestedInterestGroupEventWriteSchema,
} from "@dotkomonline/rpc/interest-group-event"
import { Button, Text, TextLink, Title } from "@dotkomonline/ui"
import { getCurrentUTC } from "@dotkomonline/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { addDays, addHours, isAfter, setHours, setMilliseconds, setMinutes, setSeconds } from "date-fns"
import { useForm } from "react-hook-form"
import { z } from "zod"

const positiveIntString = (emptyMessage: string, invalidMessage: string) =>
  z
    .string()
    .trim()
    .min(1, emptyMessage)
    .refine((value) => /^\d+$/.test(value) && Number(value) > 0, invalidMessage)

export const InterestGroupEventRequestWriteFormSchema = RequestedInterestGroupEventWriteSchema.extend({
  title: z.string().trim().min(1, "Tittel er påkrevd"),
  description: z.string().trim().min(1, "Beskrivelse er påkrevd"),
  imageUrl: z.string().trim().min(1, "Bilde er påkrevd"),
  requestDescription: z.string(),
  requestedAmount: positiveIntString("Beløp er påkrevd", "Beløpet må være et positivt heltall i kroner"),
  expectedAttendeeCount: positiveIntString("Forventet oppmøte er påkrevd", "Antallet må være et positivt heltall"),
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

export type InterestGroupEventRequestWriteFormValues = z.infer<typeof InterestGroupEventRequestWriteFormSchema>

const tomorrowAt12 = setMilliseconds(setSeconds(setMinutes(setHours(addDays(getCurrentUTC(), 1), 12), 0), 0), 0)

export const INTEREST_GROUP_EVENT_REQUEST_WRITE_FORM_DEFAULT_VALUES = {
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
  requestDescription: "",
  requestedAmount: "",
  expectedAttendeeCount: "",
} as const satisfies InterestGroupEventRequestWriteFormValues

interface Props {
  defaultValues?: InterestGroupEventRequestWriteFormValues
  onSubmit: (values: InterestGroupEventRequestWriteFormValues) => void
  onFileUpload: (file: File) => Promise<string>
  showGuidelines?: boolean
  disabled?: boolean
}

export const InterestGroupEventRequestWriteForm = ({
  defaultValues,
  onSubmit,
  onFileUpload,
  showGuidelines = true,
  disabled,
}: Props) => {
  const form = useForm<InterestGroupEventRequestWriteFormValues>({
    resolver: zodResolver(InterestGroupEventRequestWriteFormSchema),
    defaultValues: defaultValues ?? INTEREST_GROUP_EVENT_REQUEST_WRITE_FORM_DEFAULT_VALUES,
    disabled,
  })

  return (
    <Form form={form} onSubmit={onSubmit} className="flex flex-col gap-4">
      {showGuidelines && (
        <section className="flex flex-col gap-3 rounded-xl bg-gray-100 dark:bg-stone-800 p-4">
          <Title element="h2" size="sm">
            Retningslinjer
          </Title>
          <SupportRequestGuidelines />
        </section>
      )}

      <section className="flex flex-col gap-6 rounded-xl bg-gray-100 dark:bg-stone-800 p-4">
        <div className="flex flex-col">
          <Title element="h2" size="sm">
            Arrangement
          </Title>
          <Text className="text-sm text-muted-foreground">
            Feltene under blir arrangementet som publiseres når søknaden godkjennes.
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
            required
          />
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

      <section className="flex flex-col gap-6 rounded-xl bg-gray-100 dark:bg-stone-800 p-4">
        <div className="flex flex-col">
          <Title element="h2" size="sm">
            Søknad
          </Title>
          <Text className="text-sm text-muted-foreground">
            Hvor mye trenger dere, omtrent hvor mange kommer, og er det noe Backlog bør vite i tillegg?
          </Text>
        </div>
        <div className="flex flex-col gap-4">
          <TextField
            control={form.control}
            name="requestedAmount"
            label="Hvor mye trenger dere i støtte?"
            description="Merk at dere i de fleste tilfeller vil få denne summen delt på antall personer i støtte per person, og at vi gir støtte basert på faktisk antall personer som får glede av støtten, for eksempel antall oppmøtte."
            placeholder="500"
            type="number"
            min={1}
            required
          />
          <TextField
            control={form.control}
            name="expectedAttendeeCount"
            label="Hvor mange forventer dere at møter opp?"
            description="Vi fokuserer på støtte per person for at utdeling av midler skal være mest mulig rettferdig. Dersom dere søker om 1000 kroner fordi dere tror 10 personer møter opp, men kun 5 møter opp får dere kun 500 kroner, med mindre det er god grunn til noe annet. På den andre siden - kommer det 12 personer får dere fremdeles bare refundert 1000 kroner, grunnet behov for forutsigbar budsjettering fra vår side."
            placeholder="10"
            type="number"
            min={1}
            required
          />
          <TextareaField
            control={form.control}
            name="requestDescription"
            label="Tilleggsinformasjon"
            placeholder="Vi trenger utstyr til de som ikke har eget."
            description="Valgfritt. Skriv det Backlog trenger for å vurdere søknaden, som ikke allerede står i arrangementet."
          />
        </div>
      </section>

      {!disabled && (
        <Button type="submit" variant="default" className="w-fit">
          Send søknad
        </Button>
      )}
    </Form>
  )
}

const SupportRequestGuidelines = () => {
  return (
    <div className="flex flex-col gap-3 text-sm">
      <Text>
        Her kan du søke om økonomisk støtte til interessegruppen din. Backlog behandler søknaden, og du får svar på
        søknaden så raskt som mulig. Husk at alle arrangementer skal annonseres i{" "}
        <TextLink href="https://onlinentnu.slack.com/archives/C09CNP84E0P" target="_blank">
          #interessegrupper
        </TextLink>{" "}
        på Slack, slik at det er lett for hvem som helst i Online å delta. Om dere trenger hjelp med promotering av
        arrangementet, kan dere sende en e-post til{" "}
        <TextLink href="mailto:backlog@online.ntnu.no" target="_blank">
          backlog@online.ntnu.no
        </TextLink>
        .
      </Text>
      <Text className="font-medium">Retningslinjer:</Text>
      <ol className="flex list-decimal flex-col gap-2 pl-5">
        <li>
          Vi fokuserer på støtte per person. Søker dere om 500 kroner fordi dere tror 10 personer møter opp, men kun 5
          møter opp, får dere kun 250 kroner, med mindre det er god grunn til noe annet. På den andre siden: kommer det
          12 personer, får dere fremdeles bare refundert 500 kroner, for at vi skal kunne ha et forutsigbart budsjett.
        </li>
        <li>
          Man søker løpende gjennom semesteret for hvert arrangement, med mindre man søker om større engangssummer til
          for eksempel utstyr.
        </li>
        <li>
          Man må selv legge ut, og i etterkant sende inn kvittering på kvittering.online.ntnu.no med informasjon om hvor
          mange som møtte opp. Kvitteringen må sendes innen 2 uker etter arrangementet. På feltet «ansvarlig enhet»
          setter du Backlog, og ellers bare beskriv hva utlegget har gått til.
        </li>
      </ol>
      <Text>
        Send oss en mail om du lurer på noe, eller om du mener søknaden har en god grunn til å ikke møte disse
        retningslinjene og allikevel bør innvilges, så kan vi se på det.
      </Text>
      <Text>Det innvilges normalt 50 kr per person hvis støtten brukes til mat.</Text>
      <Text>Det innvilges normalt 100 kr per person hvis støtten brukes til aktiviteter.</Text>
    </div>
  )
}
