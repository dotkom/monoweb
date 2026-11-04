"use client"

import { useAuthorization } from "@admin/auth/authorization-context"
import { PermissionTooltip } from "@admin/components/PermissionTooltip"
import { canCreateGroups } from "@dotkomonline/rpc/group-permissions"
import { Button, Title } from "@dotkomonline/ui"
import { IconPencil } from "@tabler/icons-react"
import Link from "next/link"
import { GroupTable } from "./components/GroupTable"
import { useGroupAllQuery } from "./queries"

const GroupPage = () => {
  const { groups, isLoading } = useGroupAllQuery()
  const authorization = useAuthorization()
  const canCreate = canCreateGroups(authorization)

  return (
    <div className="flex flex-col gap-4">
      <Title element="h1" className="text-4xl">
        Grupper
      </Title>
      <GroupTable
        groups={groups}
        isLoading={isLoading}
        actions={
          <PermissionTooltip allowed={canCreate}>
            <Button
              variant="default"
              size="lg"
              element={Link}
              href="/admin/grupper/ny"
              icon={<IconPencil />}
              disabled={!canCreate}
            >
              Opprett gruppe
            </Button>
          </PermissionTooltip>
        }
      />
    </div>
  )
}

export default GroupPage
