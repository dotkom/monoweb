"use client"

import { useAuthorization } from "@/auth/authorization-context"
import { PermissionTooltip } from "@/components/PermissionTooltip"
import { Button, Title } from "@dotkomonline/ui"
import { IconPencil } from "@tabler/icons-react"
import Link from "next/link"
import { GroupTable } from "./components/GroupTable"
import { useGroupAllQuery } from "./queries"

const GroupPage = () => {
  const { groups, isLoading } = useGroupAllQuery()
  const { canCreateGroup } = useAuthorization()
  const canCreate = canCreateGroup("COMMITTEE") || canCreateGroup("INTEREST_GROUP")

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
              href="/grupper/ny"
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
