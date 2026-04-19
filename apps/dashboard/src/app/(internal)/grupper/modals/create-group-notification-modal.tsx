import { useFormBuilder } from "@/components/forms/Form"
import { createRichTextInput } from "@/components/forms/RichTextInput/RichTextInput"
import { createSelectInput } from "@/components/forms/SelectInput"
import { createTextInput } from "@/components/forms/TextInput"
import { mapNotificationTypeToLabel, NotificationTypeSchema, NotificationWriteSchema } from "@dotkomonline/rpc"
import { getActiveGroupMembership } from "@dotkomonline/types"
import { type ContextModalProps, modals } from "@mantine/modals"
import type { FC } from "react"
import { useGroupAllQuery, useGroupMembersAllQuery } from "../queries"
import { useCreateGroupNotificationMutation } from "../mutations"

interface CreateGroupNotificationModalProps {
  groupSlug: string
}

export const CreateGroupNotificationModal: FC<ContextModalProps<CreateGroupNotificationModalProps>> = ({
  context,
  id,
  innerProps: { groupSlug },
}) => {
  const close = () => context.closeModal(id)
  const create = useCreateGroupNotificationMutation(groupSlug)
  const { members } = useGroupMembersAllQuery(groupSlug)
  const { groups } = useGroupAllQuery()

  const recipientIds = Array.from(members.entries())
    .filter(([, member]) => getActiveGroupMembership(member, groupSlug) !== null)
    .map(([userId]) => userId)

  const FormComponent = useFormBuilder({
    schema: NotificationWriteSchema,
    defaultValues: {
      recipientIds,
      taskId: null,
      payloadType: "GROUP",
      payload: groupSlug,
    },
    onSubmit: (data) => {
      create.mutate(data)
      close()
    },
    label: "Legg inn ny varsling",
    fields: {
      title: createTextInput({
        label: "Tittel",
        placeholder: "Juleball Påmeldingen er åpen!",
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
      actorGroupId: createSelectInput({
        label: "Ansvarlig gruppe",
        placeholder: "Velg gruppe",
        data: groups.map((group) => ({ value: group.slug, label: group.abbreviation })),
        searchable: true,
        required: true,
      }),
    },
  })

  return <FormComponent />
}

export const openCreateGroupNotificationModal =
  ({ groupSlug }: CreateGroupNotificationModalProps) =>
  () =>
    modals.openContextModal({
      modal: "group/notification/create",
      title: "Legg inn ny varsling",
      size: "lg",
      innerProps: { groupSlug },
    })
