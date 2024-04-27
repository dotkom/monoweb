import { EventWriteSchema } from "@dotkomonline/types"
import { z } from "zod"
import { useCommitteeAllQuery } from "../../../modules/committee/queries/use-committee-all-query"
import {
  createCheckboxInput,
  createDateTimeInput,
  createMultipleSelectInput,
  createSelectInput,
  createTextInput,
  createTextareaInput,
  useFormBuilder,
} from "../../form"
import { validateEvent } from "./event-form-validation"

const EVENT_FORM_DEFAULT_VALUES: FormValidationResult = {
  start: new Date(),
  end: new Date(),
  description: "Mer informasjon og påmelding kommer når arrangementet nærmer seg!",
  imageUrl: null,
  locationAddress: null,
  subtitle: null,
  committeeIds: [],
  public: false,
  status: "TBA",
  title: "",
  type: "SOCIAL",
  attendanceId: null,
  locationLink: null,
  locationTitle: "",
}

interface UseEventWriteFormProps {
  onSubmit(data: z.infer<typeof EventWriteFormValidationSchema>): void
}

export const EventWriteFormValidationSchema = EventWriteSchema.extend({
  committeeIds: z.array(z.string()),
}).superRefine((data, ctx) => {
  const issues = validateEvent(data)
  for (const issue of issues) {
    ctx.addIssue(issue)
  }
})

type FormValidationResult = z.infer<typeof EventWriteFormValidationSchema>

export const useEventWriteForm = ({ onSubmit }: UseEventWriteFormProps) => {
  const { committees } = useCommitteeAllQuery()
  return useFormBuilder({
    schema: EventWriteFormValidationSchema,
    defaultValues: EVENT_FORM_DEFAULT_VALUES,
    onSubmit,
    label: "Opprett arrangement",
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
      }),
      locationAddress: createTextInput({
        label: "Sted",
        placeholder: "Åre",
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
}
