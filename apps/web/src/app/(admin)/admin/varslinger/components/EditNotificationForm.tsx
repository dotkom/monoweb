"use client"

import { useAuthorization } from "@admin/auth/authorization-context"
import { RichTextField } from "@admin/components/forms/RichTextField"
import { TextField } from "@admin/components/forms/TextField"
import { TextareaField } from "@admin/components/forms/TextareaField"
import { canManageNotification } from "@dotkomonline/rpc/notification-permissions"
import {
  getNotificationLinkTypeLabel,
  NotificationMessageSchema,
  type NotificationMessage,
  type NotificationManagement,
} from "@dotkomonline/rpc/notification"
import { Button, cn, Text } from "@dotkomonline/ui"
import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect } from "react"
import { useForm, useWatch } from "react-hook-form"
import type { z } from "zod"
import { useEditNotificationMutation } from "../mutations"

const DraftFormSchema = NotificationMessageSchema
const SentFormSchema = DraftFormSchema.extend({
  shortDescription: NotificationMessageSchema.shape.shortDescription.trim().min(1, "Kort beskrivelse er påkrevd"),
})

type FormInput = z.input<typeof DraftFormSchema>
type FormValues = z.output<typeof DraftFormSchema>

export function EditNotificationForm({
  notification,
  onSuccess,
  contentDraft,
  onContentChange,
  className,
}: {
  notification: NotificationManagement
  onSuccess?: () => void
  contentDraft?: NotificationMessage
  onContentChange?: (values: Pick<NotificationManagement, "title" | "content" | "shortDescription">) => void
  className?: string
}) {
  const authorization = useAuthorization()
  const canManage = canManageNotification(authorization, notification.actorGroup)
  const editNotification = useEditNotificationMutation()
  const isDraft = notification.status === "DRAFT"
  const formSchema = isDraft ? DraftFormSchema : SentFormSchema
  const { handleSubmit, control, formState, reset } = useForm<FormInput, unknown, FormValues>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    disabled: !canManage || editNotification.isPending,
    values: contentDraft,
    defaultValues: {
      title: notification.title,
      content: notification.content,
      shortDescription: notification.shortDescription,
    },
  })

  const [title, content, shortDescription] = useWatch({
    control,
    name: ["title", "content", "shortDescription"],
  })

  useEffect(() => {
    onContentChange?.({ title, content: content ?? "", shortDescription })
  }, [title, content, shortDescription, onContentChange])

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
        {isDraft
          ? "Lagre innholdet før du velger Send varsling øverst på siden."
          : "Endringer vil ikke varsle på nytt, og bare oppdatere innholdet"}
      </Text>

      <TextField control={control} name="title" label="Tittel" required />
      <RichTextField control={control} name="content" label="Melding" />
      <TextareaField
        control={control}
        name="shortDescription"
        label="Kort beskrivelse"
        description="Vises i varslingslisten."
        required={!isDraft}
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
