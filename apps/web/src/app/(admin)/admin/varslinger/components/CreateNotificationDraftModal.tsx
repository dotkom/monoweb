"use client"

import { useAuthorization } from "@admin/auth/authorization-context"
import { CheckboxField } from "@admin/components/forms/CheckboxField"
import { FieldShell } from "@admin/components/forms/FieldShell"
import { RichTextField } from "@admin/components/forms/RichTextField"
import { SelectField } from "@admin/components/forms/SelectField"
import { TextField } from "@admin/components/forms/TextField"
import { useGroupAllQuery } from "@admin/grupper/queries"
import { getGroupDisplayName } from "@dotkomonline/rpc/group"
import { canActAsNotificationGroup, canSendImportantNotification } from "@dotkomonline/rpc/notification-permissions"
import {
  NotificationSourceSchema,
  NotificationMessageSchema,
  MAXIMUM_NOTIFICATION_SHORT_DESCRIPTION_LENGTH,
  getNotificationLinkTypeLabel,
  type NotificationSource,
} from "@dotkomonline/rpc/notification"
import { COMMITTEE_AFFILIATIONS } from "@dotkomonline/rpc/permissions"
import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  Separator,
  Text,
  Textarea,
  TextInput,
} from "@dotkomonline/ui"
import { richTextToPlainText } from "@dotkomonline/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { IconX } from "@tabler/icons-react"
import { type ChangeEvent, useEffect, useMemo, useState } from "react"
import { useController, useForm, useWatch } from "react-hook-form"
import { z } from "zod"
import { useCreateNotificationDraftMutation } from "../mutations"

const FormSchema = NotificationMessageSchema.extend({
  actorGroupId: z.string().min(1, "Avsender er påkrevd"),
  isImportant: z.boolean(),
  linkUrl: z
    .string()
    .trim()
    .nullable()
    .transform((value) => value || null)
    .pipe(z.url("Ugyldig URL").nullable()),
})

type FormInput = z.input<typeof FormSchema>
type FormValues = z.output<typeof FormSchema>

export type NotificationDraftSource =
  | Exclude<NotificationSource, { type: "EVENT" }>
  | { type: "EVENT"; eventId: string; eventTitle: string; hostingGroupSlugs: string[] }

export function CreateNotificationDraftModal({
  open,
  onOpenChange,
  source,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  source: NotificationDraftSource
}) {
  const closeModal = () => onOpenChange(false)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        size="lg"
        className="flex max-h-[calc(100dvh-2rem)] flex-col overflow-y-auto"
        onOutsideClick={closeModal}
      >
        <div className="flex items-start justify-between gap-3">
          <DialogTitle>Ny varsling</DialogTitle>
          <DialogClose type="button">
            <IconX className="size-5" />
          </DialogClose>
        </div>
        {open && <CreateNotificationDraftForm source={source} onClose={closeModal} />}
      </DialogContent>
    </Dialog>
  )
}

function CreateNotificationDraftForm({ source, onClose }: { source: NotificationDraftSource; onClose: () => void }) {
  const authorization = useAuthorization()
  const { groups } = useGroupAllQuery()
  const createDraft = useCreateNotificationDraftMutation()
  const canSendImportant = canSendImportantNotification(authorization)
  const [hasEditedShortDescription, setHasEditedShortDescription] = useState(false)

  const eligibleGroups = useMemo(() => {
    const candidateGroupSlugs = source.type === "EVENT" ? source.hostingGroupSlugs : COMMITTEE_AFFILIATIONS

    return groups.filter((group) => {
      const belongsToSource = candidateGroupSlugs.includes(group.slug)
      const canSendAsGroup = canActAsNotificationGroup(authorization, group)

      return belongsToSource && canSendAsGroup
    })
  }, [authorization, groups, source])

  const firstEligibleGroup = eligibleGroups[0]
  const senderOptions = eligibleGroups.map((group) => ({ value: group.slug, label: getGroupDisplayName(group) }))
  const defaultTitle = source.type === "EVENT" ? `Melding om ${source.eventTitle}` : ""

  const { control, handleSubmit, getValues, setValue, formState } = useForm<FormInput, unknown, FormValues>({
    resolver: zodResolver(FormSchema),
    mode: "onChange",
    defaultValues: {
      title: defaultTitle,
      content: "",
      shortDescription: "",
      actorGroupId: firstEligibleGroup?.slug ?? "",
      isImportant: false,
      linkUrl: null,
    },
  })

  const { field: shortDescriptionField } = useController({ control, name: "shortDescription" })
  const content = useWatch({ control, name: "content" })
  const actorGroupId = useWatch({ control, name: "actorGroupId" })
  const selectedActorGroup = eligibleGroups.find((group) => group.slug === actorGroupId)
  const selectedActorGroupName = selectedActorGroup === undefined ? "" : getGroupDisplayName(selectedActorGroup)

  useEffect(() => {
    if (hasEditedShortDescription) {
      return
    }

    const plainContent = richTextToPlainText(content, null)
    const shortDescription = plainContent
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, MAXIMUM_NOTIFICATION_SHORT_DESCRIPTION_LENGTH)

    if (shortDescription === getValues("shortDescription")) {
      return
    }

    setValue("shortDescription", shortDescription, { shouldValidate: true })
  }, [content, getValues, hasEditedShortDescription, setValue])

  useEffect(() => {
    if (actorGroupId !== "" || firstEligibleGroup === undefined) {
      return
    }

    setValue("actorGroupId", firstEligibleGroup.slug, { shouldValidate: true })
  }, [actorGroupId, firstEligibleGroup, setValue])

  const handleShortDescriptionChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setHasEditedShortDescription(true)
    shortDescriptionField.onChange(event.target.value)
  }

  const onSubmit = handleSubmit(async (values) => {
    const notificationType = values.isImportant && canSendImportant ? "BROADCAST_IMPORTANT" : "BROADCAST"
    const link = values.linkUrl === null ? { type: "NONE" as const } : { type: "URL" as const, url: values.linkUrl }

    try {
      await createDraft.mutateAsync({
        title: values.title,
        content: values.content,
        shortDescription: values.shortDescription,
        actorGroupId: values.actorGroupId,
        type: notificationType,
        source: NotificationSourceSchema.parse(source),
        link: source.type === "GLOBAL" ? link : undefined,
      })
    } catch {
      return
    }

    onClose()
  })

  return (
    <form className="flex flex-col gap-4" onSubmit={onSubmit}>
      <Text className="text-sm text-muted-foreground">
        Opprett et utkast. Du kan forhåndsvise innholdet og velge mottakere før du sender.
      </Text>
      <TextField control={control} name="title" label="Tittel" required />
      <RichTextField control={control} name="content" label="Melding" />
      <FieldShell
        id="shortDescription"
        label="Kort beskrivelse"
        description="Vises i varslingslisten. Kan fylles ut senere."
        error={formState.errors.shortDescription?.message}
      >
        <Textarea
          id="shortDescription"
          name={shortDescriptionField.name}
          ref={shortDescriptionField.ref}
          rows={2}
          value={shortDescriptionField.value}
          onBlur={shortDescriptionField.onBlur}
          onChange={handleShortDescriptionChange}
        />
      </FieldShell>

      {senderOptions.length > 1 ? (
        <SelectField control={control} name="actorGroupId" label="Avsender" required options={senderOptions} />
      ) : (
        <TextInput label="Avsender" value={selectedActorGroupName} readOnly />
      )}

      <Separator />
      {source.type === "GLOBAL" ? (
        <TextField
          control={control}
          name="linkUrl"
          label="URL"
          type="url"
          placeholder="https://…"
          description="La feltet stå tomt for ingen lenke."
        />
      ) : (
        <Text className="text-sm text-muted-foreground">Lenke: {getNotificationLinkTypeLabel(source.type)}</Text>
      )}

      {canSendImportant && (
        <CheckboxField
          control={control}
          name="isImportant"
          label="Viktig varsling"
          description="Ignorerer mottakernes varslingsinnstillinger"
        />
      )}
      <div className="flex justify-end">
        <Button type="submit" disabled={!formState.isValid || createDraft.isPending}>
          Opprett utkast
        </Button>
      </div>
    </form>
  )
}
