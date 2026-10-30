"use client"

import { useAuthorization } from "@admin/auth/authorization-context"
import { RichTextField } from "@admin/components/forms/RichTextField"
import { TextField } from "@admin/components/forms/TextField"
import { TextareaField } from "@admin/components/forms/TextareaField"
import { canManageNotification } from "@dotkomonline/rpc/notification-permissions"
import { getNotificationLinkTypeLabel, type NotificationManagement } from "@dotkomonline/rpc/notification"
import { Button, cn, Text } from "@dotkomonline/ui"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useEditNotificationMutation } from "../mutations"

const FormSchema = z.object({
  title: z.string().min(1, "Tittel er påkrevd").max(120),
  content: z.string().optional(),
  shortDescription: z.string().min(1, "Kort beskrivelse er påkrevd").max(160),
})

type FormInput = z.input<typeof FormSchema>
type FormValues = z.output<typeof FormSchema>

export function EditNotificationForm({
  notification,
  onSuccess,
  className,
}: {
  notification: NotificationManagement
  onSuccess?: () => void
  className?: string
}) {
  const authorization = useAuthorization()
  const canManage = canManageNotification(authorization, notification.actorGroup)
  const editNotification = useEditNotificationMutation()
  const { handleSubmit, control, formState, reset } = useForm<FormInput, unknown, FormValues>({
    resolver: zodResolver(FormSchema),
    mode: "onChange",
    disabled: !canManage,
    defaultValues: {
      title: notification.title,
      content: notification.content,
      shortDescription: notification.shortDescription,
    },
  })

  const onSubmit = handleSubmit(async (values) => {
    if (!canManage || editNotification.isPending) {
      return
    }

    try {
      await editNotification.mutateAsync({
        id: notification.id,
        input: {
          title: values.title,
          content: values.content,
          shortDescription: values.shortDescription,
        },
      })
    } catch {
      return
    }

    reset(values)
    onSuccess?.()
  })

  return (
    <form className={cn("flex flex-col gap-4", className)} onSubmit={onSubmit}>
      <Text className="text-sm text-muted-foreground">
        Endringer vil ikke varsle på nytt, og bare oppdatere innholdet
      </Text>

      <TextField control={control} name="title" label="Tittel" required />
      <RichTextField control={control} name="content" label="Melding" />
      <TextareaField
        control={control}
        name="shortDescription"
        label="Kort beskrivelse"
        description="Vises i varslingslisten."
        required
        rows={2}
      />
      <Text className="text-sm text-muted-foreground">
        Lenke: {getNotificationLinkTypeLabel(notification.link.type)}
      </Text>

      <div className="flex justify-end">
        <Button
          variant="default"
          type="submit"
          disabled={!canManage || !formState.isValid || editNotification.isPending}
        >
          Lagre
        </Button>
      </div>
    </form>
  )
}
