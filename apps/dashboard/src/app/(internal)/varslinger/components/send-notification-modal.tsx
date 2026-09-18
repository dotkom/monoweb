"use client"

import { useNotifyAttendeesMutation } from "@/app/(internal)/arrangementer/mutations"
import { useGroupAllQuery } from "@/app/(internal)/grupper/queries"
import { useAuthorization } from "@/auth/authorization-context"
import { COMMITTEE_AFFILIATIONS, intersectGroupAffiliations, isCommitteeAffiliation } from "@/auth/permissions"
import { useRichTextInput } from "@/components/forms/RichTextInput/RichTextInput"
import type { Attendance } from "@dotkomonline/rpc/attendance"
import type { Event } from "@dotkomonline/rpc/event"
import { getGroupDisplayName } from "@dotkomonline/rpc/group"
import type {
  NotificationLink,
  NotificationRecipientAttendanceSelectionOption,
  NotificationRecipientPaymentStatus,
  NotificationRecipientReservationStatus,
  NotificationRecipientSelection,
  NotificationRecipientSelectionRule,
} from "@dotkomonline/rpc/notification"
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
import { IconPencil } from "@tabler/icons-react"
import { zodResolver } from "@hookform/resolvers/zod"
import { type FC, useEffect, useMemo, useState } from "react"
import { useForm, useWatch } from "react-hook-form"
import { z } from "zod"
import { useCreateNotificationMutation } from "../mutations"
import { useRecipientSelectionPreview } from "../queries"
import { EventAttendeeRecipientFilters } from "./event-attendee-recipient-filters"
import { RecipientSelectionBuilder } from "./recipient-selection"

const FormSchema = z.object({
  title: z.string().min(1, "Tittel er påkrevd").max(120),
  content: z.string().optional(),
  shortDescription: z.string().min(1, "Kort beskrivelse er påkrevd").max(160),
  actorGroupId: z.string().min(1, "Avsender er påkrevd"),
  isImportant: z.boolean(),
  sendEmail: z.boolean(),
  linkType: z.enum(["NONE", "URL"]),
  linkUrl: z.string().optional(),
})

type FormInput = z.input<typeof FormSchema>
type FormValues = z.output<typeof FormSchema>

export type SendNotificationSource =
  | {
      kind: "EVENT"
      eventId: string
      attendanceId: string
      eventTitle: string
      hostingGroupSlugs: string[]
      hasPayment: boolean
      selections: Attendance["selections"]
    }
  | {
      kind: "GLOBAL"
    }

function toShortDescription(html: string): string {
  return richTextToPlainText(html, null).replace(/\s+/g, " ").trim().slice(0, 160)
}

function formatRecipientCountLabel(count: number): string {
  if (count === 1) {
    return "Sendes til 1 person"
  }

  return `Sendes til ${count} personer`
}

function getNotificationType(isImportant: boolean, isAdministrator: boolean): "BROADCAST" | "BROADCAST_IMPORTANT" {
  if (isImportant && isAdministrator) {
    return "BROADCAST_IMPORTANT"
  }

  return "BROADCAST"
}

function buildNotificationLink(source: SendNotificationSource, values: FormValues): NotificationLink {
  if (source.kind === "EVENT") {
    return { type: "EVENT", eventId: source.eventId }
  }

  if (values.linkType === "URL" && values.linkUrl !== undefined && values.linkUrl.length > 0) {
    return { type: "URL", url: values.linkUrl }
  }

  return { type: "NONE" }
}

function getEventRecipientSelection(
  attendanceId: string,
  reservationStatus: NotificationRecipientReservationStatus,
  paymentStatus: NotificationRecipientPaymentStatus,
  attendanceSelectionOptions: NotificationRecipientAttendanceSelectionOption[] | null
): NotificationRecipientSelection {
  const rule: Extract<NotificationRecipientSelectionRule, { type: "EVENT_ATTENDEES" }> = {
    type: "EVENT_ATTENDEES",
    attendanceId,
    reservationStatus,
    paymentStatus,
  }

  if (attendanceSelectionOptions !== null && attendanceSelectionOptions.length > 0) {
    rule.attendanceSelectionOptions = attendanceSelectionOptions
  }

  return {
    rules: [rule],
    excludedUserIds: [],
  }
}

export const SendNotificationModal: FC<ContextModalProps<SendNotificationSource>> = ({
  context,
  id,
  innerProps: source,
}) => {
  const close = () => context.closeModal(id)
  const { isAdministrator, isCommitteeMember, affiliations } = useAuthorization()
  const { groups } = useGroupAllQuery()
  const createNotification = useCreateNotificationMutation()
  const notifyAttendees = useNotifyAttendeesMutation()
  const ContentInput = useRichTextInput<FormInput, FormValues>({
    label: "Melding",
    required: false,
  })

  const eligibleGroups = useMemo(() => {
    const authorizationState = { isAdministrator, isCommitteeMember, affiliations }
    let eligibleSlugs: string[]

    if (source.kind === "EVENT") {
      eligibleSlugs = [...intersectGroupAffiliations(authorizationState, source.hostingGroupSlugs)]
    } else if (isAdministrator) {
      eligibleSlugs = [...COMMITTEE_AFFILIATIONS]
    } else {
      eligibleSlugs = [...affiliations.keys()].filter(isCommitteeAffiliation)
    }

    return groups.filter((group) => eligibleSlugs.includes(group.slug))
  }, [affiliations, groups, isAdministrator, isCommitteeMember, source])

  const [recipientSelection, setRecipientSelection] = useState<NotificationRecipientSelection | null>(() => {
    if (source.kind !== "EVENT") {
      return null
    }

    return getEventRecipientSelection(source.attendanceId, "RESERVED", "ALL", null)
  })

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
      title: source.kind === "EVENT" ? `Melding om ${source.eventTitle}` : "",
      content: "",
      shortDescription: "",
      actorGroupId: eligibleGroups[0]?.slug ?? "",
      isImportant: false,
      sendEmail: false,
      linkType: "NONE",
      linkUrl: "",
    },
  })

  const content = useWatch({ control, name: "content" })
  const isImportant = useWatch({ control, name: "isImportant" })
  const sendEmail = useWatch({ control, name: "sendEmail" })
  const linkType = useWatch({ control, name: "linkType" })
  const actorGroupId = useWatch({ control, name: "actorGroupId" })

  const notificationType = getNotificationType(Boolean(isImportant), isAdministrator)
  const {
    preview,
    isPending: isPreviewPending,
    isForbidden,
  } = useRecipientSelectionPreview(recipientSelection, notificationType)

  const recipientCount = preview?.recipientCount ?? 0
  const canSubmit =
    formState.isValid &&
    !isPreviewPending &&
    !isForbidden &&
    recipientCount > 0 &&
    recipientSelection !== null &&
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
    if (recipientSelection === null) {
      return
    }

    const link = buildNotificationLink(source, values)

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
        recipientSelection,
      })
    } catch {
      return
    }

    if (values.sendEmail && source.kind === "EVENT") {
      const emailMessage = plainContent.length > 0 ? plainContent : values.shortDescription

      try {
        await notifyAttendees.mutateAsync({
          eventId: source.eventId,
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
  const eventAttendeesRule =
    recipientSelection?.rules[0]?.type === "EVENT_ATTENDEES" ? recipientSelection.rules[0] : null

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
          <Button
            size="compact-sm"
            variant="subtle"
            color="gray"
            c="var(--mantine-color-text)"
            fw={400}
            onClick={() => setIsPreviewOpen((wasOpen) => !wasOpen)}
            leftSection={<IconPencil size={16} />}
          >
            Rediger forhåndsvisning
          </Button>

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

        {eligibleGroups.length > 1 ? (
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

        {source.kind === "EVENT" && (
          <Text size="sm" c="dimmed">
            Lenke: Arrangementet
          </Text>
        )}

        {source.kind === "GLOBAL" && (
          <Stack gap="xs">
            <Select
              label="Lenke"
              data={[
                { value: "NONE", label: "Ingen" },
                { value: "URL", label: "URL" },
              ]}
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

        {source.kind === "EVENT" && eventAttendeesRule !== null && (
          <Stack gap="xs">
            <Text size="sm">Påmeldte på {source.eventTitle}</Text>

            <EventAttendeeRecipientFilters
              reservationStatus={eventAttendeesRule.reservationStatus}
              paymentStatus={eventAttendeesRule.paymentStatus}
              attendanceSelectionOptions={eventAttendeesRule.attendanceSelectionOptions ?? null}
              hasPayment={source.hasPayment}
              selections={source.selections}
              onChange={(next) =>
                setRecipientSelection(
                  getEventRecipientSelection(
                    source.attendanceId,
                    next.reservationStatus,
                    next.paymentStatus,
                    next.attendanceSelectionOptions
                  )
                )
              }
            />

            {isForbidden && (
              <Text size="sm" c="red">
                Du kan ikke sende til disse mottakerne
              </Text>
            )}
          </Stack>
        )}

        {source.kind === "GLOBAL" && (
          <RecipientSelectionBuilder
            value={recipientSelection}
            onChange={setRecipientSelection}
            type={notificationType}
          />
        )}

        {source.kind === "EVENT" && (
          <>
            <Divider />

            <Stack gap="xs">
              <Checkbox label="Varsel i appen" checked disabled />
              <Checkbox
                label="E-post"
                checked={sendEmail}
                onChange={(event) => setValue("sendEmail", event.currentTarget.checked)}
              />
            </Stack>
          </>
        )}

        {isAdministrator && (
          <>
            <Divider />

            <Switch
              label="Viktig varsling"
              description="Ignorerer mottakernes varslingsinnstillinger"
              checked={isImportant}
              onChange={(event) => setValue("isImportant", event.currentTarget.checked)}
            />
          </>
        )}

        <Divider />

        <Group justify={source.kind === "GLOBAL" ? "flex-end" : "space-between"} align="center">
          {source.kind !== "GLOBAL" && recipientSelection === null && (
            <Text size="sm" c="dimmed">
              Legg til minst én mottakergruppe
            </Text>
          )}

          {source.kind !== "GLOBAL" && recipientSelection !== null && isPreviewPending && (
            <Skeleton height={16} width={160} />
          )}

          {source.kind !== "GLOBAL" && recipientSelection !== null && !isPreviewPending && (
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

export function openSendNotificationModal(source: SendNotificationSource) {
  const title = source.kind === "EVENT" ? "Send melding til påmeldte" : "Ny varsling"
  const size = source.kind === "GLOBAL" ? "xl" : "lg"

  return modals.openContextModal({
    modal: "notification/send",
    title,
    size,
    innerProps: source,
  })
}

export function openEventNotificationModal(
  event: Pick<Event, "id" | "title" | "hostingGroups">,
  attendance: Pick<Attendance, "id" | "attendancePrice" | "selections">
) {
  return openSendNotificationModal({
    kind: "EVENT",
    eventId: event.id,
    attendanceId: attendance.id,
    eventTitle: event.title,
    hostingGroupSlugs: event.hostingGroups.map((group) => group.slug),
    hasPayment: attendance.attendancePrice !== null,
    selections: attendance.selections,
  })
}
