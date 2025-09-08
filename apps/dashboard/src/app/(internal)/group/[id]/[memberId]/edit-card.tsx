import { GenericTable } from "@/components/GenericTable"
import { useConfirmDeleteModal } from "@/components/molecules/ConfirmDeleteModal/confirm-delete-modal"
import type { GroupMembership } from "@dotkomonline/types"
import { Box, Button, Divider, Stack, Title } from "@mantine/core"
import type { FC } from "react"
import { useGroupMemberForm } from "../../group-member-form"
import { useEndGroupMembershipMutation, useStartGroupMembershipMutation } from "../../mutations"
import { useGroupDetailsContext } from "../provider"
import { useGroupMemberDetailsContext } from "./provider"
import { useGroupMembershipTable } from "./use-group-membership-table"

const getCurrentMembershipRoles = (memberships: GroupMembership[] | undefined) => {
  return memberships?.filter((membership) => membership.end === null).flatMap((membership) => membership.roles) ?? []
}

export const GroupMemberEditCard: FC = () => {
  const { groupMember } = useGroupMemberDetailsContext()
  const { group } = useGroupDetailsContext()

  const startMembership = useStartGroupMembershipMutation()
  const endMembership = useEndGroupMembershipMutation()

  const table = useGroupMembershipTable({ groupMember })

  const open = useConfirmDeleteModal({
    title: "Avslutt medlemskap",
    text: `Er du sikker på at du vil avslutte medlemskapet for ${groupMember?.name}?`,
    confirmText: "Avslutt medlemskap",
    cancelText: "Avbryt",
    onConfirm: () => {
      endMembership.mutate({ groupId: group.slug, userId: groupMember.id })
    },
  })

  const FormComponent = useGroupMemberForm({
    groupId: group.slug,
    defaultValues: { roleIds: getCurrentMembershipRoles(groupMember.groupMemberships).map((role) => role.id) },
    onSubmit: (data) => {
      startMembership.mutate({
        userId: groupMember.id,
        groupId: group.slug,
        roleIds: data.roleIds,
      })
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
