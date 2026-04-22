import { useFormBuilder } from "@/components/forms/Form"
import { createRichTextInput } from "@/components/forms/RichTextInput/RichTextInput"
import { createSelectInput } from "@/components/forms/SelectInput"
import { createTextInput } from "@/components/forms/TextInput"
import type { z } from "zod"
import {
  mapNotificationTypeToLabel,
  NotificationTypeSchema,
  NotificationWriteSchema,
} from "@dotkomonline/rpc"

const NOTIFICATION_FORM_DEFAULT_VALUES: Partial<NotificationWriteFormSchema> = {
  recipientIds: [],
  taskId: null,
  payloadType: "NONE",
  actorGroupId: null,
}

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
  return useFormBuilder({
    schema: NotificationWriteSchema,
    defaultValues,
    onSubmit,
    label,
    fields: {
      title: createTextInput({
        label: "Tittel",
        placeholder: "Nytt oppmøtested!",
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
          label: mapNotificationTypeToLabel(type),
        })),
        label: "Type",
        placeholder: "Velg type",
        required: true,
      }),
    },
  })
}
