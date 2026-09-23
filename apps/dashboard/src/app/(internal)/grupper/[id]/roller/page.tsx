"use client"

import { useGroupPermissions } from "@/app/(internal)/grupper/use-group-permissions"
import { PermissionTooltip } from "@/components/PermissionTooltip"
import { ReadOnlyNotice } from "@/components/ReadOnlyNotice"
import type { GroupRole } from "@dotkomonline/rpc/group"
import { Button } from "@dotkomonline/ui"
import { useState } from "react"
import { useGroupDetailsContext } from "../provider"
import { CreateGroupRoleModal } from "./components/CreateGroupRoleModal"
import { EditGroupRoleModal } from "./components/EditGroupRoleModal"
import { GroupRoleTable } from "./components/GroupRoleTable"

export default function GroupRolesPage() {
  const { group } = useGroupDetailsContext()
  const { canManageRoles, canEdit } = useGroupPermissions()
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editRole, setEditRole] = useState<GroupRole | null>(null)

  return (
    <div className="flex flex-col gap-4">
      {!canManageRoles && canEdit && (
        <ReadOnlyNotice
          title="Du kan ikke redigere roller"
          message="Dette er fordi du ikke er leder eller nestleder av gruppen. Kontakt dotkom dersom du mener dette er en feil."
        />
      )}

      <GroupRoleTable
        roles={group.roles}
        canManageRoles={canManageRoles}
        onEdit={(role) => setEditRole(role)}
        actions={
          <PermissionTooltip allowed={canManageRoles}>
            <Button type="button" variant="default" disabled={!canManageRoles} onClick={() => setIsCreateOpen(true)}>
              Opprett rolle
            </Button>
          </PermissionTooltip>
        }
      />

      <CreateGroupRoleModal
        disabled={!canManageRoles}
        open={isCreateOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsCreateOpen(false)
          }
        }}
        group={group}
      />
      <EditGroupRoleModal
        disabled={!canManageRoles}
        open={editRole !== null}
        onOpenChange={(open) => {
          if (!open) {
            setEditRole(null)
          }
        }}
        role={editRole}
      />
    </div>
  )
}
