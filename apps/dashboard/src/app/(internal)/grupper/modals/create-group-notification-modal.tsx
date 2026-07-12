import { useNotificationWriteForm } from "@/app/(internal)/varslinger/write-form"
import { getActiveGroupMembership } from "@dotkomonline/rpc/group"
import { type ContextModalProps, modals } from "@mantine/modals"
import type { FC } from "react"
import { useGroupMembersAllQuery } from "../queries"
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

  const recipientIds = Array.from(members.entries())
    .filter(([, member]) => getActiveGroupMembership(member, groupSlug) !== null)
    .map(([userId]) => userId)

  const FormComponent = useNotificationWriteForm({
    defaultValues: {
      recipientIds,
      taskId: null,
      payloadType: "GROUP",
      payload: groupSlug,
      actorGroupId: groupSlug,
    },
    onSubmit: (data) => {
      create.mutate(data, {
        onSuccess: () => {
          close()
        },
      })
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
