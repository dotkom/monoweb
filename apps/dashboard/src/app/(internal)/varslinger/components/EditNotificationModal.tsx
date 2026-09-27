"use client"

import { RichTextField } from "@/components/forms/RichTextField"
import { SelectField } from "@/components/forms/SelectField"
import { TextField } from "@/components/forms/TextField"
import { TextareaField } from "@/components/forms/TextareaField"
import {
  getNotificationLinkTypeLabel,
  NotificationPayloadTypeSchema,
  type NotificationLink,
  type NotificationManagement,
} from "@dotkomonline/rpc/notification"
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogTitle, Button, Text } from "@dotkomonline/ui"
import { zodResolver } from "@hookform/resolvers/zod"
import { IconX } from "@tabler/icons-react"
import { useForm, useWatch } from "react-hook-form"
import { z } from "zod"
import { useEditNotificationMutation } from "../mutations"

const FormSchema = z
  .object({
    title: z.string().min(1, "Tittel er påkrevd").max(120),
    content: z.string().optional(),
    shortDescription: z.string().min(1, "Kort beskrivelse er påkrevd").max(160),
    linkType: NotificationPayloadTypeSchema,
    linkUrl: z.string().optional(),
  })
  .superRefine((values, context) => {
    if (values.linkType !== "URL") {
      return
    }

    const parsedUrl = z.string().url().safeParse(values.linkUrl)

    if (!parsedUrl.success) {
      context.addIssue({
        code: "custom",
        path: ["linkUrl"],
        message: "Ugyldig URL",
      })
    }
  })

type FormInput = z.input<typeof FormSchema>
type FormValues = z.output<typeof FormSchema>

function getEditLinkTypeOptions(link: NotificationLink): { value: FormValues["linkType"]; label: string }[] {
  const options = [
    { value: "NONE" as const, label: "Ingen" },
    { value: "URL" as const, label: "URL" },
  ]

  if (link.type === "NONE" || link.type === "URL") {
    return options
  }

  return [
    {
      value: link.type,
      label: `${getNotificationLinkTypeLabel(link.type)} (nåværende)`,
    },
    ...options,
  ]
}

function buildEditedLink(
  originalLink: NotificationLink,
  linkType: FormValues["linkType"],
  linkUrl: string | undefined
): NotificationLink {
  if (linkType === "NONE") {
    return { type: "NONE" }
  }

  if (linkType === "URL") {
    return { type: "URL", url: linkUrl ?? "" }
  }

  return originalLink
}

export function EditNotificationModal({
  open,
  onOpenChange,
  notification,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  notification: NotificationManagement
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent size="lg" onOutsideClick={() => onOpenChange(false)}>
        <div className="flex items-start justify-between gap-3">
          <AlertDialogTitle>Rediger varsling</AlertDialogTitle>
          <AlertDialogCancel type="button">
            <IconX className="size-5" />
          </AlertDialogCancel>
        </div>
        {open && <EditNotificationForm notification={notification} onClose={() => onOpenChange(false)} />}
      </AlertDialogContent>
    </AlertDialog>
  )
}

function EditNotificationForm({
  notification,
  onClose,
}: {
  notification: NotificationManagement
  onClose: () => void
}) {
  const editNotification = useEditNotificationMutation()
  const { handleSubmit, control, formState } = useForm<FormInput, unknown, FormValues>({
    resolver: zodResolver(FormSchema),
    mode: "onChange",
    defaultValues: {
      title: notification.title,
      content: notification.content,
      shortDescription: notification.shortDescription,
      linkType: notification.link.type,
      linkUrl: notification.link.type === "URL" ? notification.link.url : "",
    },
  })
  const linkType = useWatch({ control, name: "linkType" })

  const onSubmit = handleSubmit(async (values) => {
    try {
      await editNotification.mutateAsync({
        id: notification.id,
        input: {
          title: values.title,
          content: values.content,
          shortDescription: values.shortDescription,
          link: buildEditedLink(notification.link, values.linkType, values.linkUrl),
        },
      })
    } catch {
      return
    }

    onClose()
  })

  return (
    <form className="flex max-h-[70vh] flex-col gap-4 overflow-y-auto" onSubmit={onSubmit}>
      <Text className="text-sm text-muted-foreground">Endringer varsler ikke mottakerne på nytt.</Text>

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
      <SelectField
        control={control}
        name="linkType"
        label="Lenke"
        required
        options={getEditLinkTypeOptions(notification.link)}
      />

      {linkType === "URL" && <TextField control={control} name="linkUrl" label="URL" required />}

      <div className="flex justify-end">
        <Button variant="default" type="submit" disabled={!formState.isValid || editNotification.isPending}>
          Lagre
        </Button>
      </div>
    </form>
  )
}
