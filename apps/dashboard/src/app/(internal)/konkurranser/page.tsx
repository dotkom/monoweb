"use client"

import { useAuthorization } from "@/auth/authorization-context"
import { PermissionTooltip } from "@/components/PermissionTooltip"
import { Button, Title } from "@dotkomonline/ui"
import { IconPencil } from "@tabler/icons-react"
import Link from "next/link"
import { ContestsTable } from "./ContestTable"
import { useContestFindManyQuery } from "./queries"

export default function ContestPage() {
  const { contests, isLoading } = useContestFindManyQuery()

  const { canCreateEvents } = useAuthorization()
  const canCreate = canCreateEvents()

  return (
    <div className="flex flex-col gap-4">
      <Title element="h1" className="text-4xl">
        Konkurranser
      </Title>

      <ContestsTable
        contests={contests}
        isLoading={isLoading}
        actions={
          <PermissionTooltip allowed={canCreate}>
            <Button
              variant="default"
              size="lg"
              element={Link}
              href="/konkurranser/ny"
              icon={<IconPencil />}
              disabled={!canCreate}
            >
              Opprett konkurranse
            </Button>
          </PermissionTooltip>
        }
      />
    </div>
  )
}
