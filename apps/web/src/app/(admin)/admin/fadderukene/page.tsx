"use client"

import { useAuthorization } from "@admin/auth/authorization-context"
import { PermissionTooltip } from "@admin/components/PermissionTooltip"
import { canManageFadderuker } from "@dotkomonline/rpc/fadderuke-permissions"
import { Button, Title } from "@dotkomonline/ui"
import { IconPencil } from "@tabler/icons-react"
import Link from "next/link"
import { FadderukerTable } from "./FadderukerTable"
import { useFadderukeFindManyQuery } from "./queries"

export default function FadderukenePage() {
  const { fadderuker, isLoading } = useFadderukeFindManyQuery()
  const authorization = useAuthorization()
  const canEdit = canManageFadderuker(authorization)

  return (
    <div className="flex flex-col gap-4">
      <Title element="h1" className="text-4xl">
        Fadderukene
      </Title>
      <div className="flex flex-col gap-2">
        <FadderukerTable
          isLoading={isLoading}
          fadderuker={fadderuker}
          canEdit={canEdit}
          actions={
            <PermissionTooltip allowed={canEdit}>
              <Button
                variant="default"
                size="lg"
                element={Link}
                href="/admin/fadderukene/ny"
                icon={<IconPencil />}
                disabled={!canEdit}
              >
                Opprett fadderuke
              </Button>
            </PermissionTooltip>
          }
        />
      </div>
    </div>
  )
}
