import { useFormBuilder } from "@/components/forms/Form"
import { createRecipientPickerInput } from "@/components/forms/RecipientPickerInput"
import { createRichTextInput } from "@/components/forms/RichTextInput/RichTextInput"
import { createSelectInput } from "@/components/forms/SelectInput"
import { createTextInput } from "@/components/forms/TextInput"
import { z } from "zod"
import {
  mapNotificationTypeToLabel,
  NotificationTypeSchema,
  NotificationWriteSchema,
} from "@dotkomonline/rpc"

const NOTIFICATION_FORM_DEFAULT_VALUES: Partial<NotificationWriteFormSchema> = {
  recipientIds: [],
  taskId: null,
  payloadType: "NONE",
  payload: null,
  actorGroupId: null,
}

type NotificationWriteFormSchema = z.infer<typeof NotificationWriteSchema>

interface UseNotificationWriteFormProps {
  onSubmit(data: z.infer<typeof NotificationWriteSchema>): void
  defaultValues?: Partial<NotificationWriteFormSchema>
  label?: string
  disabled?: boolean
  includeRecipientPicker?: boolean
}

export const useNotificationWriteForm = ({
  onSubmit,
  label = "Legg inn ny varsling",
  defaultValues = NOTIFICATION_FORM_DEFAULT_VALUES,
  disabled,
  includeRecipientPicker = false,
}: UseNotificationWriteFormProps) => {
  const schema = includeRecipientPicker
    ? NotificationWriteSchema.extend({
        recipientIds: z.array(z.string()).min(1, "Velg minst én mottaker"),
      })
    : NotificationWriteSchema

  const fields = {
    title: createTextInput<NotificationWriteFormSchema>({
      label: "Tittel",
      placeholder: "Nytt oppmøtested!",
      required: true,
    }),
    shortDescription: createTextInput<NotificationWriteFormSchema>({
      label: "Kort beskrivelse",
      placeholder: "En kort beskrivelse av varslingen",
      required: true,
    }),
    content: createRichTextInput<NotificationWriteFormSchema>({
      label: "Innhold",
      required: true,
    }),
    type: createSelectInput<NotificationWriteFormSchema>({
      data: Object.values(NotificationTypeSchema.enum).map((type) => ({
        value: type,
        label: mapNotificationTypeToLabel(type),
      })),
      label: "Type",
      placeholder: "Velg type",
      required: true,
    }),
    ...(includeRecipientPicker
      ? {
          recipientIds: createRecipientPickerInput<NotificationWriteFormSchema>(),
        }
      : {}),
  }

  return useFormBuilder({
    schema,
    defaultValues,
    onSubmit,
    label,
    disabled,
    fields,
  })
}
