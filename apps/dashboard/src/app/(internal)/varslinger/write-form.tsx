import { useFormBuilder } from "@/components/forms/Form"
import { createRichTextInput } from "@/components/forms/RichTextInput/RichTextInput"
import { createSelectInput } from "@/components/forms/SelectInput"
import { createTextInput } from "@/components/forms/TextInput"
import type { z } from "zod"
import { useGroupAllQuery } from "../grupper/queries"
import { createSearchableSelectInput } from "@/components/forms/SearchableSelectInput"
import { useUserSearch } from "@/components/forms/hooks/useUserSearch"
import { NotificationPayloadTypeSchema, NotificationTypeSchema, NotificationWriteSchema } from "@dotkomonline/rpc"

const NOTIFICATION_FORM_DEFAULT_VALUES: Partial<NotificationWriteFormSchema> = { recipientIds: [], taskId: null }

type NotificationWriteFormSchema = z.infer<typeof NotificationWriteSchema>

interface UseNotificationWriteFormProps {
  onSubmit(data: z.infer<typeof NotificationWriteSchema>): void
  defaultValues?: Partial<NotificationWriteFormSchema>
  label?: string
}

export const useNotificationWriteForm = ({
  onSubmit,
  label = "Legg inn ny varsling",
  defaultValues = NOTIFICATION_FORM_DEFAULT_VALUES,
}: UseNotificationWriteFormProps) => {
  const { groups } = useGroupAllQuery()

  return useFormBuilder({
    schema: NotificationWriteSchema,
    defaultValues,
    onSubmit,
    label,
    fields: {
      recipientIds: createSearchableSelectInput({
        multiSelect: true,
        useSearchHook: useUserSearch,
        dataMapper: (user) => ({ value: user.id, label: `${user.name} (${user.email})` }),
        selectProps: {
          label: "Mottakere",
          placeholder: "Søk etter brukere",
        },
      }),
      title: createTextInput({
        label: "Tittel",
        placeholder: "Juleball Påmeldingen er åpen!",
        required: true,
      }),
      shortDescription: createTextInput({
        label: "Kort beskrivelse",
        placeholder: "En kort beskrivelse av varslingen",
        required: true,
      }),
      content: createRichTextInput({
        label: "Innhold",
        required: true,
      }),
      type: createSelectInput({
        data: Object.values(NotificationTypeSchema.Values).map((type) => ({
          value: type,
          label: type,
        })),
        label: "Type",
        placeholder: "Velg type",
        required: true,
      }),
      payload: createTextInput({
        label: "Payload",
        placeholder: "Payload",
        required: false,
      }),
      payloadType: createSelectInput({
        label: "payload type",
        data: Object.values(NotificationPayloadTypeSchema.Values).map((type) => ({
          value: type,
          label: type,
        })),
        placeholder: "Velg type",
        required: true,
      }),
      actorGroupId: createSelectInput({
        label: "Ansvarlig gruppe",
        placeholder: "Velg gruppe",
        data: groups.map((group) => ({ value: group.slug, label: group.abbreviation })),
        searchable: true,
        required: true,
      }),
    },
  })
}
