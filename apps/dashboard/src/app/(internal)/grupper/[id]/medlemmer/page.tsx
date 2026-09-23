"use client"

import { UserSearch } from "@/app/(internal)/brukere/components/UserSearch"
import { useGroupPermissions } from "@/app/(internal)/grupper/use-group-permissions"
import { PermissionTooltip } from "@/components/PermissionTooltip"
import { ReadOnlyNotice } from "@/components/ReadOnlyNotice"
import { type GroupMember, getActiveGroupMembership } from "@dotkomonline/rpc/group"
import type { UserId } from "@dotkomonline/rpc/user"
import type { WorkspaceMemberLink, WorkspaceMemberSyncState } from "@dotkomonline/rpc/workspace"
import { Button, Popover, PopoverContent, PopoverTrigger, Text, Title } from "@dotkomonline/ui"
import { IconAlertTriangleFilled, IconLoader2, IconUserPlus } from "@tabler/icons-react"
import { compareDesc } from "date-fns"
import { useMemo, useState } from "react"
import { useSyncWorkspaceGroupMutation } from "../../mutations"
import { useGroupMembersAllQuery, useWorkspaceMembersAllQuery } from "../../queries"
import { useGroupDetailsContext } from "../provider"
import { CreateGroupMemberModal } from "./components/CreateGroupMemberModal"
import { GroupMemberTable } from "./components/GroupMemberTable"

const SYNC_STATE_SORT_PRIORITY: Record<WorkspaceMemberSyncState, number> = {
  PENDING_LINK: 1,
  PENDING_ADD: 2,
  PENDING_REMOVE: 3,
  SYNCED: 4,
}

const sortByStartDate = (a: GroupMember | null, b: GroupMember | null) => {
  if (a === null && b === null) {
    return 0
  }

  const aStart = a?.groupMemberships.at(0)?.start
  const bStart = b?.groupMemberships.at(0)?.start

  if (!aStart || !bStart) {
    return aStart ? -1 : 1
  }

  return compareDesc(aStart, bStart)
}

export default function GroupMembersPage() {
  const { group } = useGroupDetailsContext()
  const { canManageMembership, canEdit } = useGroupPermissions()
  const syncGroupMutation = useSyncWorkspaceGroupMutation()
  const [pendingUserId, setPendingUserId] = useState<UserId | null>(null)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  const showWorkspaceColumns = Boolean(group.workspaceGroupId)
  const { members: workspaceMembers, isLoading: isLoadingWorkspaceMembers } = useWorkspaceMembersAllQuery(
    group.slug,
    showWorkspaceColumns
  )
  const { members: groupMembers, isLoading: isLoadingGroupMembers } = useGroupMembersAllQuery(
    group.slug,
    !showWorkspaceColumns
  )
  const isLoading = isLoadingGroupMembers || isLoadingWorkspaceMembers

  const mappedGroupMembers = useMemo(() => {
    if (!groupMembers) {
      return []
    }

    return [...groupMembers.values()].map(
      (groupMember) =>
        ({
          groupMember,
          workspaceMember: null,
          syncState: "SYNCED",
        }) satisfies WorkspaceMemberLink
    )
  }, [groupMembers])

  const memberLinks = showWorkspaceColumns ? (workspaceMembers ?? []) : mappedGroupMembers

  const membersList = useMemo(() => {
    if (!memberLinks) {
      return []
    }

    return memberLinks.toSorted((a, b) => {
      const aIsActive = getActiveGroupMembership(a.groupMember, group.slug) !== null
      const bIsActive = getActiveGroupMembership(b.groupMember, group.slug) !== null

      if (aIsActive !== bIsActive) {
        return aIsActive ? -1 : 1
      }

      if (a.syncState === b.syncState) {
        return sortByStartDate(a.groupMember, b.groupMember)
      }

      return SYNC_STATE_SORT_PRIORITY[a.syncState] - SYNC_STATE_SORT_PRIORITY[b.syncState]
    })
  }, [memberLinks, group.slug])

  const activeMemberIds = useMemo(() => {
    return membersList.map(({ groupMember }) => groupMember?.id).filter((id): id is string => Boolean(id))
  }, [membersList])

  const memberStatuses = useMemo(() => {
    return Object.groupBy(membersList, ({ syncState }) => syncState)
  }, [membersList])

  const toAdd = memberStatuses.PENDING_ADD?.length ?? 0
  const toRemove = memberStatuses.PENDING_REMOVE?.length ?? 0
  const needsLinking = memberStatuses.PENDING_LINK?.length ?? 0
  const isOutOfSync = showWorkspaceColumns && toAdd + toRemove + needsLinking > 0

  return (
    <div className="flex flex-col gap-4">
      {!canManageMembership && canEdit && (
        <ReadOnlyNotice
          title="Du kan ikke redigere medlemmer"
          message="Dette er fordi du ikke er leder eller nestleder av gruppen. Kontakt dotkom dersom du mener dette er en feil."
        />
      )}

      {showWorkspaceColumns && isLoadingWorkspaceMembers ? (
        <div className="flex items-center gap-2 rounded-md bg-muted/50 p-4">
          <IconLoader2 className="size-4 animate-spin" />
          <Text>Laster inn synkroniseringstatus...</Text>
        </div>
      ) : (
        isOutOfSync && (
          <div className="flex flex-col gap-4 rounded-md bg-muted/50 p-4">
            <div className="flex items-center gap-2">
              <IconAlertTriangleFilled className="size-5 text-red-600" />
              <Title element="h3" className="text-lg font-semibold">
                Medlemmer og e-postlisten er usynkronisert
              </Title>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button type="button" variant="outline" size="sm">
                    Forklaring
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="max-w-3xl min-w-64 p-3">
                  <div className="flex flex-col gap-2 text-sm">
                    <Text>
                      I OW5 velger vi å la deg synkronisere etter du har gjort endringer, for å gi deg mer kontroll over
                      hvor raskt endringer skjer og for å unngå magi. I OW4 ble synkronisering gjort automatisk to
                      ganger om dagen.
                    </Text>
                    <Text>
                      OW5-gruppen er source of truth for hvem som skal være i e-postlisten. Det betyr at om noen legges
                      manuelt inn i e-postlisten uten å ligge i OW-gruppen, vil systemet ønske å fjerne dem. Dette vil
                      skje om du avslutter medlemskapet til noen, hvor de da også skal fjernes fra e-postlisten. Dersom
                      du lager et nytt medlemskap for noen, og de ikke allerede ligger i e-postlisten, vil systemet
                      ønske å legge dem til.
                    </Text>
                    <Text>
                      Vi holder styr på hvilken e-postadresse som tilhører hvem ved å tilknytte OW-brukeren og
                      Google-brukeren. Dersom dette ikke er gjort, vil du få opp at brukeren "mangler tilknyttet
                      bruker". Dette skal ikke normalt skje, og det er veldig viktig at du kontakter HS dersom dette
                      skjer, slik at de kan fikse det for deg.
                    </Text>
                  </div>
                </PopoverContent>
              </Popover>
              <Text className="text-sm text-muted-foreground">
                TLDR: Alltid trykk på knappen når den er der og du er ferdig med å redigere
              </Text>
            </div>

            <ul className="list-disc pl-6 text-sm">
              {needsLinking > 0 && (
                <li>
                  <Text className="text-sm">Mangler tilknyttet bruker (kontakt HS snarest): {needsLinking}</Text>
                </li>
              )}
              {toAdd > 0 && (
                <li>
                  <Text className="text-sm">Må legges til: {toAdd}</Text>
                </li>
              )}
              {toRemove > 0 && (
                <li>
                  <Text className="text-sm">Må fjernes: {toRemove}</Text>
                </li>
              )}
            </ul>

            <PermissionTooltip allowed={canManageMembership}>
              <Button
                type="button"
                variant="default"
                disabled={!canManageMembership}
                onClick={() => syncGroupMutation.mutate({ groupSlug: group.slug })}
              >
                Synkroniser nå
              </Button>
            </PermissionTooltip>
          </div>
        )
      )}

      <GroupMemberTable
        data={membersList}
        groupId={group.slug}
        showWorkspaceColumns={showWorkspaceColumns}
        isLoading={isLoading}
        actions={
          <Popover open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <PermissionTooltip allowed={canManageMembership}>
              <PopoverTrigger asChild>
                <Button variant="default" icon={<IconUserPlus className="size-4" />} disabled={!canManageMembership}>
                  Legg til bruker
                </Button>
              </PopoverTrigger>
            </PermissionTooltip>
            <PopoverContent className="w-80 p-3">
              {isAddModalOpen && (
                <UserSearch
                  listOpen
                  autoHightlight
                  excludeUserIds={activeMemberIds}
                  placeholder="Søk etter navn eller e-post"
                  onSubmit={(values) => setPendingUserId(values.id)}
                  disabled={!canManageMembership}
                />
              )}
            </PopoverContent>
          </Popover>
        }
      />

      <CreateGroupMemberModal
        disabled={!canManageMembership}
        open={pendingUserId !== null}
        onOpenChange={(open) => {
          if (!open) {
            setPendingUserId(null)
          }
        }}
        group={group}
        userId={pendingUserId}
      />
    </div>
  )
}
