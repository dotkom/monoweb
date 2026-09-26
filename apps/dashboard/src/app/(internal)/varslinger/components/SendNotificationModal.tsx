"use client"

import { useNotifyAttendeesMutation } from "@/app/(internal)/arrangementer/mutations"
import { useGroupAllQuery } from "@/app/(internal)/grupper/queries"
import { useAuthorization } from "@/auth/authorization-context"
import { COMMITTEE_AFFILIATIONS, intersectGroupAffiliations, isCommitteeAffiliation } from "@/auth/permissions"
import { CheckboxField } from "@/components/forms/CheckboxField"
import { FieldShell } from "@/components/forms/FieldShell"
import { RichTextField } from "@/components/forms/RichTextField"
import { SelectField } from "@/components/forms/SelectField"
import { TextField } from "@/components/forms/TextField"
import type { Attendance } from "@dotkomonline/rpc/attendance"
import { getGroupDisplayName } from "@dotkomonline/rpc/group"
import type {
  NotificationLink,
  NotificationRecipientAttendanceSelectionOption,
  NotificationRecipientPaymentStatus,
  NotificationRecipientReservationStatus,
  NotificationRecipientSelection,
  NotificationRecipientSelectionRule,
} from "@dotkomonline/rpc/notification"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogTitle,
  Button,
  Checkbox,
  Label,
  Separator,
  Text,
  Textarea,
  TextInput,
} from "@dotkomonline/ui"
import { richTextToPlainText } from "@dotkomonline/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { IconX } from "@tabler/icons-react"
import { useEffect, useMemo, useState } from "react"
import { useController, useForm, useWatch } from "react-hook-form"
import { z } from "zod"
import { useCreateNotificationMutation } from "../mutations"
import { useRecipientSelectionPreview } from "../queries"
import { EventAttendeeRecipientFilters } from "./EventAttendeeRecipientFilters"
import { RecipientSelectionBuilder } from "./RecipientSelection"

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

export function SendNotificationModal({
  open,
  onOpenChange,
  source,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  source: SendNotificationSource
}) {
  const title = source.kind === "EVENT" ? "Send melding til påmeldte" : "Ny varsling"
  const size = source.kind === "GLOBAL" ? "xl" : "lg"

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent size={size} onOutsideClick={() => onOpenChange(false)}>
        <div className="flex items-start justify-between gap-3">
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogCancel type="button">
            <IconX className="size-5" />
          </AlertDialogCancel>
        </div>
        {open && <SendNotificationForm source={source} onClose={() => onOpenChange(false)} />}
      </AlertDialogContent>
    </AlertDialog>
  )
}

function SendNotificationForm({ source, onClose }: { source: SendNotificationSource; onClose: () => void }) {
  const { isAdministrator, isCommitteeMember, affiliations } = useAuthorization()
  const { groups } = useGroupAllQuery()
  const createNotification = useCreateNotificationMutation()
  const notifyAttendees = useNotifyAttendeesMutation()

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

  const { handleSubmit, control, setValue, setError, formState } = useForm<FormInput, unknown, FormValues>({
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
  const shortDescriptionField = useController({ control, name: "shortDescription" })

  const content = useWatch({ control, name: "content" })
  const isImportant = useWatch({ control, name: "isImportant" })
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
        onClose()
        return
      }
    }

    onClose()
  })

  const selectedActorGroup = eligibleGroups.find((group) => group.slug === actorGroupId)
  const eventAttendeesRule =
    recipientSelection?.rules[0]?.type === "EVENT_ATTENDEES" ? recipientSelection.rules[0] : null

  return (
    <form className="flex max-h-[70vh] flex-col gap-4 overflow-y-auto" onSubmit={onSubmit}>
      <TextField control={control} name="title" label="Tittel" required />
      <RichTextField control={control} name="content" label="Melding" />
      <FieldShell
        id="shortDescription"
        label="Kort beskrivelse"
        description="Denne teksten vises i varslingslisten i navbar-en, mens meldingen vises i detaljvisningen."
        required
        error={formState.errors.shortDescription?.message}
      >
        <Textarea
          id="shortDescription"
          name={shortDescriptionField.field.name}
          ref={shortDescriptionField.field.ref}
          rows={2}
          value={shortDescriptionField.field.value ?? ""}
          onBlur={shortDescriptionField.field.onBlur}
          onChange={(event) => {
            setHasEditedShortDescription(true)
            shortDescriptionField.field.onChange(event)
          }}
        />
      </FieldShell>

      {eligibleGroups.length > 1 ? (
        <SelectField
          control={control}
          name="actorGroupId"
          label="Avsender"
          required
          options={eligibleGroups.map((group) => ({
            value: group.slug,
            label: getGroupDisplayName(group),
          }))}
        />
      ) : (
        <TextInput
          label="Avsender"
          value={selectedActorGroup === undefined ? "" : getGroupDisplayName(selectedActorGroup)}
          readOnly
        />
      )}

      <Separator />

      {source.kind === "EVENT" && <Text className="text-sm text-muted-foreground">Lenke: Arrangementet</Text>}

      {source.kind === "GLOBAL" && (
        <div className="flex flex-col gap-3">
          <SelectField
            control={control}
            name="linkType"
            label="Lenke"
            required
            options={[
              { value: "NONE", label: "Ingen" },
              { value: "URL", label: "URL" },
            ]}
          />
          {linkType === "URL" && <TextField control={control} name="linkUrl" label="URL" />}
        </div>
      )}

      <Separator />

      {source.kind === "EVENT" && eventAttendeesRule !== null && (
        <div className="flex flex-col gap-3">
          <Text className="text-sm">Påmeldte på {source.eventTitle}</Text>
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
          {isForbidden && <Text className="text-sm text-red-600">Du kan ikke sende til disse mottakerne</Text>}
        </div>
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
          <Separator />
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Checkbox id="in-app-notification" checked disabled />
              <Label htmlFor="in-app-notification">Varsel i appen</Label>
            </div>
            <CheckboxField control={control} name="sendEmail" label="E-post" />
          </div>
        </>
      )}

      {isAdministrator && (
        <>
          <Separator />
          <CheckboxField
            control={control}
            name="isImportant"
            label="Viktig varsling"
            description="Ignorerer mottakernes varslingsinnstillinger"
          />
        </>
      )}

      <Separator />

      <div className={source.kind === "GLOBAL" ? "flex justify-end" : "flex items-center justify-between gap-3"}>
        {source.kind !== "GLOBAL" && recipientSelection === null && (
          <Text className="text-sm text-muted-foreground">Legg til minst én mottakergruppe</Text>
        )}
        {source.kind !== "GLOBAL" && recipientSelection !== null && isPreviewPending && (
          <div className="h-4 w-40 animate-pulse rounded-sm bg-muted" />
        )}
        {source.kind !== "GLOBAL" && recipientSelection !== null && !isPreviewPending && (
          <Text className="text-sm text-muted-foreground">{formatRecipientCountLabel(recipientCount)}</Text>
        )}
        <Button type="submit" disabled={!canSubmit}>
          Send
        </Button>
      </div>
    </form>
  )
}
