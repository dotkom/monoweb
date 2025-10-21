import { UserSearch } from "@/app/(internal)/user/components/user-search"
import {
  type GroupId,
  type GroupMember,
  type WorkspaceMemberSyncAction,
  getActiveGroupMembership,
} from "@dotkomonline/types"
import {
  Box,
  Button,
  Card,
  Divider,
  Group,
  List,
  ListItem,
  Popover,
  PopoverDropdown,
  PopoverTarget,
  Stack,
  Table,
  TableTbody,
  TableTd,
  TableTh,
  TableThead,
  TableTr,
  Text,
  Title,
} from "@mantine/core"
import { IconAlertTriangleFilled } from "@tabler/icons-react"
import { flexRender } from "@tanstack/react-table"
import { compareDesc } from "date-fns"
import { type FC, useMemo } from "react"
import { useCreateGroupMemberModal } from "../modals/create-group-member-modal"
import { useSyncWorkspaceGroupMutation } from "../mutations"
import { useGroupMembersAllQuery, useWorkspaceMembersAllQuery } from "../queries"
import { useGroupDetailsContext } from "./provider"
import { useGroupMemberTable } from "./use-group-member-table"

// Lower number means higher priority
const SYNC_ACTION_SORT_PRIORITY: Record<WorkspaceMemberSyncAction, number> = {
  TO_ADD: 1,
  TO_REMOVE: 2,
  NEEDS_LINKING: 3,
  NONE: 4,
}

const sortByStartDate = (a: GroupMember | null, b: GroupMember | null) => {
  if (a === null && b === null) {
    return 0
  }

  // Assumes memberships are sorted by start date descending
  const aStart = a?.groupMemberships.at(0)?.start
  const bStart = b?.groupMemberships.at(0)?.start

  if (!aStart || !bStart) {
    return aStart ? -1 : 1
  }

  return compareDesc(aStart, bStart)
}

export const GroupMembersPage: FC = () => {
  const { group } = useGroupDetailsContext()
  const syncGroupMutation = useSyncWorkspaceGroupMutation()

  // We only want to fetch workspace members if the group is linked to a workspace group
  // We don't want to display workspace columns if we do not fetch workspace members
  // And we do not want to color the rows based on sync action if we do not fetch workspace members
  // Hence, we have two calls to fetch members, one with workspace members and one with just group members
  // To make things easier, we then transform the group member list to the same shape as the workspace member list
  const showWorkspaceColumns = Boolean(group.workspaceGroupId)
  const { members: membersWithWorkspace } = useWorkspaceMembersAllQuery(group.slug, showWorkspaceColumns)
  const { members: membersWithoutWorkspace } = useGroupMembersAllQuery(group.slug, !showWorkspaceColumns)

  const lol = useMemo(() => {
    if (!membersWithoutWorkspace) return []

    return [...membersWithoutWorkspace.values()].map(
      (groupMember) =>
        ({
          groupMember,
          workspaceMember: null,
          syncAction: "NONE",
        }) as const
    )
  }, [membersWithoutWorkspace])

  const members = showWorkspaceColumns ? membersWithWorkspace : lol

  const openCreate = useCreateGroupMemberModal({ group })

  const membersList = useMemo(() => {
    if (!members) return []

    // Sort by active members first, then by sync action, then by start date
    return members.toSorted((a, b) => {
      const aIsActive = getActiveGroupMembership(a.groupMember, group.slug) !== null
      const bIsActive = getActiveGroupMembership(b.groupMember, group.slug) !== null

      if (aIsActive !== bIsActive) {
        return aIsActive ? -1 : 1
      }

      if (a.syncAction === b.syncAction) {
        return sortByStartDate(a.groupMember, b.groupMember)
      }

      return SYNC_ACTION_SORT_PRIORITY[a.syncAction] - SYNC_ACTION_SORT_PRIORITY[b.syncAction]
    })
  }, [members, group.slug])

  const membersTable = useGroupMemberTable({
    data: membersList,
    groupId: group.slug,
    showWorkspaceColumns,
  })

  const activeMemberIds = useMemo(() => {
    return membersList.map(({ groupMember }) => groupMember?.id).filter((id): id is string => Boolean(id))
  }, [membersList])

  const memberStatuses = useMemo(() => {
    return Object.groupBy(membersList, ({ syncAction }) => syncAction)
  }, [membersList])

  const toAdd = memberStatuses.TO_ADD?.length ?? 0
  const toRemove = memberStatuses.TO_REMOVE?.length ?? 0
  const needsLinking = memberStatuses.NEEDS_LINKING?.length ?? 0
  const isOutOfSync = showWorkspaceColumns && toAdd + toRemove + needsLinking > 0

  return (
    <Box>
      <Stack>
        <Title order={3} mb={10}>
          Legg til bruker
        </Title>
        <UserSearch onSubmit={(values) => openCreate({ userId: values.id })} excludeUserIds={activeMemberIds} />
        <Divider />
        <Title order={3}>Medlemmer</Title>

        {isOutOfSync && (
          <Stack bg="var(--mantine-color-gray-light)" p="md" style={{ borderRadius: "var(--mantine-radius-md)" }}>
            <Group gap="xs">
              <IconAlertTriangleFilled size={22} color="var(--mantine-color-red-text)" />
              <Title order={4}>Medlemmer og e-postlisten er usynkronisert</Title>
            </Group>

            <Group>
              <Popover position="bottom-start">
                <PopoverTarget>
                  <Button variant="light" size="sm" w="fit-content">
                    Forklaring
                  </Button>
                </PopoverTarget>
                <PopoverDropdown maw="min(75vw, 48rem)" miw="16rem">
                  <Stack gap="xs">
                    <Text size="sm">
                      I OW5 velger vi å la deg synkronisere etter du har gjort endringer, for å gi deg mer kontroll over
                      hvor raskt endringer skjer og for å unngå magi. I OW4 ble synkronisering gjort automatisk to
                      ganger om dagen.
                    </Text>
                    <Text size="sm">
                      OW5-gruppen er source of truth for hvem som skal være i e-postlisten. Det betyr at om noen legges
                      manuelt inn i e-postlisten uten å ligge i OW-gruppen, vil systemet ønske å fjerne dem. Dette vil
                      skje om du avslutter medlemskapet til noen, hvor de da også skal fjernes fra e-postlisten. Dersom
                      du lager et nytt medlemskap for noen, og de ikke allerede ligger i e-postlisten, vil systemet
                      ønske å legge dem til.
                    </Text>
                    <Text size="sm">
                      Vi holder styr på hvilken e-postadresse som tilhører hvem ved å tilknytte OW-brukeren og
                      Google-brukeren. Dersom dette ikke er gjort, vil du få opp at brukeren "mangler tilknyttet
                      bruker". Dette skal ikke normalt skje, og det er veldig viktig at du kontakter HS dersom dette
                      skjer, slik at de kan fikse det for deg.
                    </Text>
                  </Stack>
                </PopoverDropdown>
              </Popover>
              <Text size="sm" c="dimmed">
                TLDR: Alltid trykk på knappen når den er der og du er ferdig med å redigere
              </Text>
            </Group>

            <Stack>
              <List withPadding>
                {needsLinking > 0 && (
                  <ListItem>
                    <Text size="sm">Mangler tilknyttet bruker (kontakt HS snarest): {needsLinking}</Text>
                  </ListItem>
                )}
                {toAdd > 0 && (
                  <ListItem>
                    <Text size="sm">Må legges til: {toAdd}</Text>
                  </ListItem>
                )}
                {toRemove > 0 && (
                  <ListItem>
                    <Text size="sm">Må fjernes: {toRemove}</Text>
                  </ListItem>
                )}
              </List>
              <Group>
                <Button disabled onClick={() => syncGroupMutation.mutate({ groupSlug: group.slug })}>
                  Synkroniser nå
                </Button>
              </Group>
            </Stack>
          </Stack>
        )}

        <MemberTable table={membersTable} groupSlug={group.slug} enableRowBackgroundColor={showWorkspaceColumns} />
      </Stack>
    </Box>
  )
}

interface MemberTableProps {
  table: ReturnType<typeof useGroupMemberTable>
  groupSlug?: GroupId
  enableRowBackgroundColor?: boolean
}

const MemberTable = ({ table, groupSlug, enableRowBackgroundColor = false }: MemberTableProps) => {
  return (
    <Card withBorder p="xs">
      <Table.ScrollContainer minWidth={600} maxHeight={400} type="native">
        <Table stickyHeader>
          <TableThead>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableTr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableTh
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    style={{
                      backgroundColor: "var(--mantine-color-default)",
                    }}
                  >
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </span>
                  </TableTh>
                ))}
              </TableTr>
            ))}
          </TableThead>
          <TableTbody>
            {table.getRowModel().rows.length === 0 && (
              <TableTr>
                <TableTd colSpan={table.getAllColumns().length} align="center">
                  <Text>Ingen data</Text>
                </TableTd>
              </TableTr>
            )}
            {table.getRowModel().rows.map((row) => {
              const isInactive =
                Boolean(row.original.groupMember) && !getActiveGroupMembership(row.original.groupMember, groupSlug)

              const background = enableRowBackgroundColor
                ? getRowBackground(row.original.syncAction, isInactive)
                : undefined

              return (
                <TableTr key={row.id} bg={background}>
                  {row.getVisibleCells().map((cell) => (
                    <TableTd key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableTd>
                  ))}
                </TableTr>
              )
            })}
          </TableTbody>
        </Table>
      </Table.ScrollContainer>
    </Card>
  )
}

const getRowBackground = (syncAction: WorkspaceMemberSyncAction, isInactive: boolean) => {
  if (syncAction === "TO_ADD" || syncAction === "TO_REMOVE") {
    return "var(--mantine-color-red-light)"
  }

  if (syncAction === "NEEDS_LINKING") {
    return "var(--mantine-color-yellow-light)"
  }

  if (isInactive) {
    return "var(--mantine-color-gray-light)"
  }

  return undefined
}
