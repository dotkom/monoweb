import type { Committee } from "@dotkomonline/types"
import { z } from "zod"
import { EventSchema } from "../../../../../../packages/types/src/event"
import {
  createCheckboxInput,
  createDateTimeInput,
  createMultipleSelectInput,
  createSelectInput,
  createTextInput,
  createTextareaInput,
  useFormBuilder,
} from "../../form"

interface UseEventEditFormProps {
  onSubmit(data: FormValidationResult): void
  defaultValues?: Partial<FormValidationResult>
  label?: string
  committees: Committee[]
}

const validateLocationLink = (value: string | null) => {
  if (value === null) {
    return true
  }
  if (!value.includes("google") && !value.includes("mazemap")) {
    return false
  }
  return true
}

const FormValidationSchema = EventSchema.extend({
  committeeIds: z.array(z.string()),
  locationLink: z.string().nullable().refine(validateLocationLink, {
    message: "Lenken må være en gyldig Google Maps eller MazeMap-lenke",
  }),
})
  .required({ id: true })
  .refine((data) => data.start < data.end, {
    message: "Sluttidspunkt må være etter starttidspunkt",
    path: ["end"],
  })

type FormValidationResult = z.infer<typeof FormValidationSchema>

export const useEventEditForm = ({
  committees,
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
      description: createTextareaInput({
        label: "Beskrivelse",
        placeholder: "Mer informasjon og påmelding kommer når arrangementet nærmer seg!",
        rows: 20,
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
        placeholder:
          "https://www.google.com/maps/place/Hovedbygningen+(NTNU)/@63.4194658,10.3995042,17z/data=!3m1!4b1!4m6!3m5!1s0x466d3195b7c6960b:0xf8307e00da9b2556!8m2!3d63.4194658!4d10.4020791!16s%2Fg%2F11dflf4b45?entry=ttu",
      }),
      imageUrl: createTextInput({
        label: "Bildelenke",
      }),
      start: createDateTimeInput({
        label: "Starttidspunkt",
        withAsterisk: true,
      }),
      end: createDateTimeInput({
        label: "Sluttidspunkt",
        withAsterisk: true,
      }),
      committeeIds: createMultipleSelectInput({
        label: "Arrangør",
        placeholder: "Arrkom",
        data: committees.map((committee) => ({ value: committee.id, label: committee.name })),
      }),
      status: createSelectInput({
        label: "Event status",
        placeholder: "Velg en",
        data: [
          { value: "TBA", label: "TBA" },
          { value: "PUBLIC", label: "Public" },
          { value: "NO_LIMIT", label: "No Limit" },
          { value: "ATTENDANCE", label: "Attendance" },
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
      public: createCheckboxInput({
        label: "Offentlig arrangement",
      }),
    },
  })
