"use client"

import { useAuthorization } from "@/auth/authorization-context"
import { PermissionTooltip } from "@/components/PermissionTooltip"
import { Button, Title } from "@dotkomonline/ui"
import { IconPencil } from "@tabler/icons-react"
import Link from "next/link"
import { OfflineTable } from "./OfflineTable"
import { useOfflineAllQuery } from "./queries"

export default function OfflinePage() {
  const { offlines, isLoading } = useOfflineAllQuery()
  const { canEditOffline } = useAuthorization()
  const canEdit = canEditOffline()

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
              href="/offline/ny"
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
