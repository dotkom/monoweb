import { GenericTable } from "@/components/GenericTable"
import { useConfirmDeleteModal } from "@/components/molecules/ConfirmDeleteModal/confirm-delete-modal"
import { getCurrentMembershipRoles } from "@dotkomonline/types"
import { getCurrentUtc } from "@dotkomonline/utils"
import { Box, Button, Divider, Stack, Title } from "@mantine/core"
import type { FC } from "react"
import { useGroupMemberForm } from "../../group-member-form"
import { useEndMembershipMutation, useStartMembershipMutation } from "../../mutations"
import { useGroupDetailsContext } from "../provider"
import { useGroupMemberDetailsContext } from "./provider"
import { useMembershipTable } from "./use-membership-table"
export const GroupMemberEditCard: FC = () => {
  const { groupMember } = useGroupMemberDetailsContext()
  const { group } = useGroupDetailsContext()

  const update = useStartMembershipMutation()

  const table = useMembershipTable({ groupMember })

  const endMembership = useEndMembershipMutation()
  const open = useConfirmDeleteModal({
    title: "Avslutt medlemskap",
    text: `Er du sikker på at du vil avslutte medlemskapet for ${groupMember?.name}?`,
    confirmText: "Avslutt medlemskap",
    cancelText: "Avbryt",
    onConfirm: () => {
      endMembership.mutate({ groupId: group.slug, userId: groupMember.id })
      close()
    },
  })

  const FormComponent = useGroupMemberForm({
    groupId: group.slug,
    defaultValues: { roleIds: getCurrentMembershipRoles(groupMember.groupMemberships).map((role) => role.id) },
    onSubmit: (data) => {
      update.mutate({
        data: {
          userId: groupMember.id,
          groupId: group.slug,
          start: getCurrentUtc(),
          end: null,
        },
        roleIds: data.roleIds,
      })
      close()
    },
  })

  return (
    <Stack>
      <Title order={3}>Oppdater medlemskap i {group.abbreviation}</Title>
      <FormComponent />
      <Box>
        <Button variant="outline" color="red" onClick={open}>
          Avslutt medlemskap
        </Button>
      </Box>
      <Divider />
      <Title order={3}>Historikk</Title>
      <GenericTable table={table} />
    </Stack>
  )
}
