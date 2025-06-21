import { EventWriteSchema } from "@dotkomonline/types"
import { useInterestGroupAllQuery } from "src/modules/interest-group/queries/use-interest-group-all-query"
import { z } from "zod"
import { useGroupAllQuery } from "../../../../modules/group/queries/use-group-all-query"
import {
  createCheckboxInput,
  createDateTimeInput,
  createImageInput,
  createMultipleSelectInput,
  createRichTextInput,
  createSelectInput,
  createTextInput,
  useFormBuilder,
} from "../../../form"
import { validateEventWrite } from "../validation"

const EVENT_FORM_DEFAULT_VALUES: FormValidationResult = {
  start: new Date(),
  end: new Date(),
  description: "Mer informasjon og påmelding kommer når arrangementet nærmer seg!",
  imageUrl: null,
  locationAddress: null,
  subtitle: null,
  hostingGroupIds: [],
  interestGroupIds: [],
  public: false,
  status: "DRAFT",
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
  hostingGroupIds: z.array(z.string()),
  interestGroupIds: z.array(z.string()),
}).superRefine((data, ctx) => {
  const issues = validateEventWrite(data)
  for (const issue of issues) {
    ctx.addIssue(issue)
  }
})

type FormValidationResult = z.infer<typeof EventWriteFormValidationSchema>

export const useEventWriteForm = ({ onSubmit }: UseEventWriteFormProps) => {
  const { groups } = useGroupAllQuery()
  const { interestGroups } = useInterestGroupAllQuery()
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
      description: createRichTextInput({
        label: "Beskrivelse",
        placeholder: "Mer informasjon og påmelding kommer når arrangementet nærmer seg!",
        markdown: "",
        required: true,
      }),
      locationAddress: createTextInput({
        label: "Sted",
        placeholder: "Åre",
      }),
      imageUrl: createImageInput({
        label: "Bilde",
        placeholder: "Last opp",
      }),
      start: createDateTimeInput({
        label: "Starttidspunkt",
        withAsterisk: true,
      }),
      end: createDateTimeInput({
        label: "Sluttidspunkt",
        withAsterisk: true,
      }),
      hostingGroupIds: createMultipleSelectInput({
        label: "Arrangerende komité",
        placeholder: "Arrkom",
        data: groups.map((group) => ({ value: group.id, label: group.name })),
        searchable: true,
      }),
      interestGroupIds: createMultipleSelectInput({
        label: "Arrangerende interessegruppe",
        placeholder: "Stipendsushi",
        data: interestGroups.map((interestGroup) => ({ value: interestGroup.id, label: interestGroup.name })),
        searchable: true,
      }),
      status: createSelectInput({
        label: "Event status",
        placeholder: "Velg en",
        data: [
          { value: "DRAFT", label: "Utkast" },
          { value: "PUBLIC", label: "Publisert" },
          { value: "DELETED", label: "Slettet" },
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
