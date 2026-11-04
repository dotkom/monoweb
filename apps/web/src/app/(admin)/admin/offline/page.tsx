"use client"

import { useAuthorization } from "@admin/auth/authorization-context"
import { PermissionTooltip } from "@admin/components/PermissionTooltip"
import { Button, Title } from "@dotkomonline/ui"
import { IconPencil } from "@tabler/icons-react"
import Link from "next/link"
import { OfflineTable } from "./OfflineTable"
import { useOfflineAllQuery } from "./queries"
import { canManageOfflines } from "@dotkomonline/rpc/offline-permissions"

export default function OfflinePage() {
  const { offlines, isLoading } = useOfflineAllQuery()
  const authorization = useAuthorization()
  const canEdit = canManageOfflines(authorization)

  return (
    <div className="flex flex-col gap-4">
      <Title element="h1" className="text-4xl">
        Offline
      </Title>

      <OfflineTable
        offlines={offlines}
        canEdit={canEdit}
        actions={
          <PermissionTooltip allowed={canEdit}>
            <Button
              variant="default"
              size="lg"
              element={Link}
              href="/admin/offline/ny"
              icon={<IconPencil />}
              disabled={!canEdit}
            >
              Ny Offline
            </Button>
          </PermissionTooltip>
        }
        isLoading={isLoading}
      />
    </div>
  )
}
