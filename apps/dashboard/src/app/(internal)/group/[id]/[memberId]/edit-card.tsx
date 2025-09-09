import { GenericTable } from "@/components/GenericTable"
import type { GroupMembership } from "@dotkomonline/types"
import { Divider, Group, Image, Space, Stack, Text, Title } from "@mantine/core"
import { formatDate, formatDistanceToNowStrict } from "date-fns"
import { nb } from "date-fns/locale"
import type { FC } from "react"
import { useGroupMemberForm } from "../../group-member-form"
import { useStartGroupMembershipMutation } from "../../mutations"
import { useGroupDetailsContext } from "../provider"
import { useGroupMemberDetailsContext } from "./provider"
import { useGroupMembershipTable } from "./use-group-membership-table"

const getCurrentMembershipRoles = (memberships: GroupMembership[] | undefined) => {
  return memberships?.filter((membership) => membership.end === null).flatMap((membership) => membership.roles) ?? []
}

export const GroupMemberEditCard: FC = () => {
  const { groupMember } = useGroupMemberDetailsContext()

  const startMembership = useStartGroupMembershipMutation()

  const table = useGroupMembershipTable({ groupMember })
  const { group } = useGroupDetailsContext()

  const FormComponent = useGroupMemberForm({
    groupId: group.slug,
    onSubmit: (data) => {
      startMembership.mutate({
        userId: groupMember.id,
        groupId: group.slug,
        roleIds: data.roleIds,
      })
      close()
    },
  })

  const activeMemberships = groupMember.groupMemberships
          .filter((membership) => membership.end === null)

  return (
    <Stack>
      <Group gap={6}>
        {group.imageUrl && (
          <Image
            src={group.imageUrl}
            alt={group.name ?? "Gruppens logo"}
            height={24}
            width={24}
            style={{ borderRadius: "var(--mantine-radius-sm)" }}
          />
        )}
        <Text>{group.name || "Ukjent bruker"}</Text>
      </Group>
          <Group gap={6}>
            {groupMember.imageUrl && (
              <Image
                src={groupMember.imageUrl}
                alt={groupMember.name ?? "Profilbilde"}
                height={24}
                width={24}
                style={{ borderRadius: "var(--mantine-radius-sm)" }}
              />
            )}
            <Text>{groupMember.name || "Ukjent bruker"}</Text>
          </Group>
      <Divider />

        {
          activeMemberships.length ? activeMemberships.map((membership) => (
            <Stack key={membership.id} gap={0}>
              <Title order={2}>{membership.roles.map((role) => role.name).join(", ")}</Title>
              <Text>
                {formatDistanceToNowStrict(membership.start, { locale: nb })} (siden{" "}
                {formatDate(membership.start, "dd. MMMM yyyy", { locale: nb })})
              </Text>
            </Stack>
          )) : <Text size="xl">Ikke aktivt medlem</Text>}
      <Divider />
      <FormComponent />
      <Divider />
      <Title order={3}>Historikk</Title>
      <GenericTable table={table} />
      <Space h="xl" />
    </Stack>
  )
}
