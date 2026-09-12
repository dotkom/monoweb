"use client"

import { useAuthorization } from "@/auth/authorization-context"
import { useNotifyAttendeesMutation } from "@/app/(internal)/arrangementer/mutations"
import { useRichTextInput } from "@/components/forms/RichTextInput/RichTextInput"
import { getGroupDisplayName } from "@dotkomonline/rpc/group"
import type { NotificationLink } from "@dotkomonline/rpc/notification"
import { richTextToPlainText } from "@dotkomonline/utils"
import {
  Button,
  Checkbox,
  Collapse,
  Divider,
  Group,
  Select,
  Skeleton,
  Stack,
  Switch,
  Text,
  TextInput,
  Textarea,
} from "@mantine/core"
import { type ContextModalProps, modals } from "@mantine/modals"
import { zodResolver } from "@hookform/resolvers/zod"
import { type FC, useEffect, useState } from "react"
import { useForm, useWatch } from "react-hook-form"
import { z } from "zod"
import { useAudiencePreview } from "../hooks/use-audience-preview"
import { useEligibleActorGroups } from "../hooks/use-eligible-actor-groups"
import { useCreateNotificationMutation } from "../mutations"
import {
  getDefaultAudience,
  getDefaultNotificationLink,
  getDefaultNotificationTitle,
  getSendNotificationModalTitle,
  type NotificationLaunchContext,
} from "../notification-launch-context"
import { AudienceBuilder } from "./audience-builder"
import { AudienceSummary } from "./audience-summary"

const FormSchema = z.object({
  title: z.string().min(1, "Tittel er påkrevd").max(120),
  content: z.string().optional(),
  shortDescription: z.string().min(1, "Kort beskrivelse er påkrevd").max(160),
  actorGroupId: z.string().min(1, "Avsender er påkrevd"),
  isImportant: z.boolean(),
  sendEmail: z.boolean(),
  linkType: z.enum(["NONE", "URL", "GROUP", "EVENT"]),
  linkUrl: z.string().optional(),
})

type FormInput = z.input<typeof FormSchema>
type FormValues = z.output<typeof FormSchema>

function toShortDescription(html: string): string {
  const plainText = richTextToPlainText(html, null).replace(/\s+/g, " ").trim()

  return plainText.slice(0, 160)
}

function formatRecipientCountLabel(count: number): string {
  if (count === 1) {
    return "Sendes til 1 person"
  }

  return `Sendes til ${count} personer`
}

function buildNotificationLink(
  launchContext: NotificationLaunchContext,
  linkType: FormValues["linkType"],
  linkUrl: string | undefined
): NotificationLink {
  if (launchContext.kind === "EVENT") {
    return { type: "EVENT", eventId: launchContext.eventId }
  }

  if (linkType === "URL" && linkUrl !== undefined && linkUrl.length > 0) {
    return { type: "URL", url: linkUrl }
  }

  if (linkType === "GROUP" && launchContext.kind === "GROUP") {
    return { type: "GROUP", groupSlug: launchContext.groupSlug }
  }

  return { type: "NONE" }
}

function getLinkTypeOptions(launchContext: NotificationLaunchContext) {
  if (launchContext.kind === "GROUP") {
    return [
      { value: "GROUP", label: "Gruppesiden" },
      { value: "NONE", label: "Ingen" },
      { value: "URL", label: "URL" },
    ]
  }

  return [
    { value: "NONE", label: "Ingen" },
    { value: "URL", label: "URL" },
  ]
}

function getDefaultFormLinkType(launchContext: NotificationLaunchContext): FormValues["linkType"] {
  if (launchContext.kind === "EVENT") {
    return "EVENT"
  }

  if (launchContext.kind === "GROUP") {
    return "GROUP"
  }

  return "NONE"
}

function getNotificationType(isImportant: boolean, isAdministrator: boolean): "BROADCAST" | "BROADCAST_IMPORTANT" {
  if (isImportant && isAdministrator) {
    return "BROADCAST_IMPORTANT"
  }

  return "BROADCAST"
}

export const SendNotificationModal: FC<ContextModalProps<NotificationLaunchContext>> = ({
  context,
  id,
  innerProps: launchContext,
}) => {
  const close = () => context.closeModal(id)
  const { isAdministrator } = useAuthorization()
  const eligibleGroups = useEligibleActorGroups(launchContext)
  const createNotification = useCreateNotificationMutation()
  const notifyAttendees = useNotifyAttendeesMutation()
  const ContentInput = useRichTextInput<FormInput, FormValues>({
    label: "Melding",
    required: false,
  })

  const defaultLink = getDefaultNotificationLink(launchContext)
  const [audience, setAudience] = useState(() => getDefaultAudience(launchContext))
  const [hasEditedShortDescription, setHasEditedShortDescription] = useState(false)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)

  const { register, handleSubmit, control, setValue, getValues, setError, clearErrors, formState } = useForm<
    FormInput,
    unknown,
    FormValues
  >({
    resolver: zodResolver(FormSchema),
    mode: "onChange",
    defaultValues: {
      title: getDefaultNotificationTitle(launchContext),
      content: "",
      shortDescription: "",
      actorGroupId: eligibleGroups[0]?.slug ?? "",
      isImportant: false,
      sendEmail: false,
      linkType: getDefaultFormLinkType(launchContext),
      linkUrl: defaultLink.type === "URL" ? defaultLink.url : "",
    },
  })

  const content = useWatch({ control, name: "content" })
  const isImportant = useWatch({ control, name: "isImportant" })
  const sendEmail = useWatch({ control, name: "sendEmail" })
  const linkType = useWatch({ control, name: "linkType" })
  const actorGroupId = useWatch({ control, name: "actorGroupId" })

  const notificationType = getNotificationType(Boolean(isImportant), isAdministrator)
  const { preview, isPending: isPreviewPending, isForbidden } = useAudiencePreview(audience, notificationType)
  const recipientCount = preview?.recipientCount ?? 0
  const canSubmit =
    formState.isValid &&
    !isPreviewPending &&
    !isForbidden &&
    recipientCount > 0 &&
    audience !== null &&
    !createNotification.isPending &&
    !notifyAttendees.isPending

  useEffect(() => {
    if (hasEditedShortDescription) {
      return
    }

    setValue("shortDescription", toShortDescription(content ?? ""), { shouldValidate: true })
  }, [content, hasEditedShortDescription, setValue])

  useEffect(() => {
    if (actorGroupId !== "" || eligibleGroups[0] === undefined) {
      return
    }

    setValue("actorGroupId", eligibleGroups[0].slug, { shouldValidate: true })
  }, [actorGroupId, eligibleGroups, setValue])

  const onSubmit = handleSubmit(async (values) => {
    if (audience === null) {
      return
    }

    const link = buildNotificationLink(launchContext, values.linkType, values.linkUrl)

    if (link.type === "URL") {
      const isValidUrl = URL.canParse(link.url)

      if (!isValidUrl) {
        setError("linkUrl", { type: "manual", message: "Ugyldig URL" })
        return
      }
    }

    const plainContent = richTextToPlainText(values.content ?? "", null).trim()
    let contentToSend: string | undefined

    if (plainContent.length > 0) {
      contentToSend = values.content
    }

    try {
      await createNotification.mutateAsync({
        title: values.title,
        shortDescription: values.shortDescription,
        content: contentToSend,
        type: getNotificationType(values.isImportant, isAdministrator),
        link,
        actorGroupId: values.actorGroupId,
        audience,
      })
    } catch {
      return
    }

    if (values.sendEmail && launchContext.kind === "EVENT") {
      const emailMessage = plainContent.length > 0 ? plainContent : values.shortDescription

      try {
        await notifyAttendees.mutateAsync({
          eventId: launchContext.eventId,
          message: emailMessage,
        })
      } catch {
        close()
        return
      }
    }

    close()
  })

  const selectedActorGroup = eligibleGroups.find((group) => group.slug === actorGroupId)
  const shouldShowActorGroupSelect = eligibleGroups.length > 1
  const previewErrorMessage = isForbidden ? "Du kan ikke sende til disse mottakerne" : null

  return (
    <form onSubmit={onSubmit}>
      <Stack gap="lg">
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
          defaultValue=""
        />

        <div>
          <Text
            component="button"
            type="button"
            size="sm"
            c="blue"
            onClick={() => setIsPreviewOpen((wasOpen) => !wasOpen)}
          >
            Rediger forhåndsvisning
          </Text>
          <Collapse in={isPreviewOpen}>
            <Textarea
              mt="xs"
              label="Kort beskrivelse"
              description="Vises i varslingslisten. Oppdateres automatisk fra meldingen til du redigerer den."
              minRows={2}
              autosize
              {...register("shortDescription", {
                onChange: () => setHasEditedShortDescription(true),
              })}
              error={formState.errors.shortDescription?.message}
            />
          </Collapse>
        </div>

        {shouldShowActorGroupSelect ? (
          <Select
            label="Avsender"
            withAsterisk
            data={eligibleGroups.map((group) => ({
              value: group.slug,
              label: getGroupDisplayName(group),
            }))}
            value={actorGroupId}
            onChange={(value) => {
              if (value === null) {
                return
              }

              setValue("actorGroupId", value, { shouldValidate: true })
            }}
            error={formState.errors.actorGroupId?.message}
          />
        ) : (
          <TextInput
            label="Avsender"
            value={selectedActorGroup === undefined ? "" : getGroupDisplayName(selectedActorGroup)}
            readOnly
          />
        )}

        <Divider />

        {launchContext.kind === "EVENT" && (
          <Text size="sm" c="dimmed">
            Lenke: Arrangementet
          </Text>
        )}

        {launchContext.kind !== "EVENT" && (
          <Stack gap="xs">
            <Select
              label="Lenke"
              data={getLinkTypeOptions(launchContext)}
              value={linkType}
              onChange={(value) => {
                const parsedLinkType = FormSchema.shape.linkType.safeParse(value)

                if (!parsedLinkType.success) {
                  return
                }

                setValue("linkType", parsedLinkType.data, { shouldValidate: true })
              }}
            />
            {linkType === "URL" && (
              <TextInput label="URL" {...register("linkUrl")} error={formState.errors.linkUrl?.message} />
            )}
          </Stack>
        )}

        <Divider />

        {audience !== null && launchContext.kind !== "GLOBAL" && (
          <AudienceSummary
            launchContext={launchContext}
            value={audience}
            onChange={setAudience}
            errorMessage={previewErrorMessage}
          />
        )}

        {launchContext.kind === "GLOBAL" && (
          <AudienceBuilder value={audience} onChange={setAudience} type={notificationType} />
        )}

        <Divider />

        {launchContext.kind === "EVENT" && (
          <Stack gap="xs">
            <Checkbox label="Varsel i appen" checked disabled />
            <Checkbox
              label="E-post"
              checked={sendEmail}
              onChange={(event) => setValue("sendEmail", event.currentTarget.checked)}
            />
          </Stack>
        )}

        <Divider />

        {isAdministrator && (
          <Switch
            label="Viktig varsling"
            description="Ignorerer mottakernes varslingsinnstillinger"
            checked={isImportant}
            onChange={(event) => setValue("isImportant", event.currentTarget.checked)}
          />
        )}

        <Group justify="space-between" align="center">
          {audience === null && (
            <Text size="sm" c="dimmed">
              Legg til minst én mottakergruppe
            </Text>
          )}
          {audience !== null && isPreviewPending && <Skeleton height={16} width={160} />}
          {audience !== null && !isPreviewPending && (
            <Text size="sm" c="dimmed">
              {formatRecipientCountLabel(recipientCount)}
            </Text>
          )}
          <Button
            type="submit"
            loading={createNotification.isPending || notifyAttendees.isPending}
            disabled={!canSubmit}
          >
            Send
          </Button>
        </Group>
      </Stack>
    </form>
  )
}

export function openSendNotificationModal(launchContext: NotificationLaunchContext) {
  return modals.openContextModal({
    modal: "notification/send",
    title: getSendNotificationModalTitle(launchContext),
    size: launchContext.kind === "GLOBAL" ? "xl" : "lg",
    innerProps: launchContext,
  })
}
