"use client"

import { useRichTextInput } from "@/components/forms/RichTextInput/RichTextInput"
import {
  getNotificationLinkTypeLabel,
  NotificationPayloadTypeSchema,
  type NotificationLink,
  type NotificationManagement,
} from "@dotkomonline/rpc/notification"
import { Button, Group, Select, Stack, Text, Textarea, TextInput } from "@mantine/core"
import { type ContextModalProps, modals } from "@mantine/modals"
import { zodResolver } from "@hookform/resolvers/zod"
import type { FC } from "react"
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

function getDefaultEditLinkType(link: NotificationLink): FormValues["linkType"] {
  return link.type
}

function getDefaultEditLinkUrl(link: NotificationLink): string {
  if (link.type === "URL") {
    return link.url
  }

  return ""
}

function getEditLinkTypeOptions(link: NotificationLink) {
  const options = [
    { value: "NONE", label: "Ingen" },
    { value: "URL", label: "URL" },
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

export const EditNotificationModal: FC<ContextModalProps<{ notification: NotificationManagement }>> = ({
  context,
  id,
  innerProps: { notification },
}) => {
  const close = () => context.closeModal(id)
  const editNotification = useEditNotificationMutation()
  const ContentInput = useRichTextInput<FormInput, FormValues>({
    label: "Melding",
    required: false,
  })

  const { register, handleSubmit, control, setValue, getValues, setError, clearErrors, formState } = useForm<
    FormInput,
    unknown,
    FormValues
  >({
    resolver: zodResolver(FormSchema),
    mode: "onChange",
    defaultValues: {
      title: notification.title,
      content: notification.content,
      shortDescription: notification.shortDescription,
      linkType: getDefaultEditLinkType(notification.link),
      linkUrl: getDefaultEditLinkUrl(notification.link),
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

    close()
  })

  return (
    <form onSubmit={onSubmit}>
      <Stack>
        <Text size="sm" c="dimmed">
          Endringer varsler ikke mottakerne på nytt.
        </Text>

        <TextInput label="Tittel" withAsterisk {...register("title")} error={formState.errors.title?.message} />

        <ContentInput
          name="content"
          register={register}
          control={control}
          state={formState}
          setValue={setValue}
          getValues={getValues}
          setError={setError}
          clearErrors={clearErrors}
          defaultValue={notification.content}
        />

        <Textarea
          label="Kort beskrivelse"
          description="Vises i varslingslisten."
          minRows={2}
          autosize
          {...register("shortDescription")}
          error={formState.errors.shortDescription?.message}
        />

        <Select
          label="Lenke"
          data={getEditLinkTypeOptions(notification.link)}
          value={linkType}
          onChange={(value) => {
            const parsedLinkType = NotificationPayloadTypeSchema.safeParse(value)

            if (!parsedLinkType.success) {
              return
            }

            setValue("linkType", parsedLinkType.data, { shouldValidate: true })
          }}
        />

        {linkType === "URL" && (
          <TextInput label="URL" withAsterisk {...register("linkUrl")} error={formState.errors.linkUrl?.message} />
        )}

        <Group justify="flex-end">
          <Button type="submit" loading={editNotification.isPending} disabled={!formState.isValid}>
            Lagre
          </Button>
        </Group>
      </Stack>
    </form>
  )
}

export function openEditNotificationModal(notification: NotificationManagement) {
  return modals.openContextModal({
    modal: "notification/edit",
    title: "Rediger varsling",
    size: "lg",
    innerProps: { notification },
  })
}
