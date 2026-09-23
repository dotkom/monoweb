"use client"

import { useAuthorization } from "@admin/auth/authorization-context"
import { PermissionTooltip } from "@admin/components/PermissionTooltip"
import { Button, Title } from "@dotkomonline/ui"
import { IconPencil } from "@tabler/icons-react"
import Link from "next/link"
import { ApplicationTable } from "./ApplicationTable"
import { useApplicationPeriodFindManyQuery } from "./queries"

export default function ApplicationPage() {
  const { applicationPeriods, isLoading } = useApplicationPeriodFindManyQuery()

  const { canEditApplication } = useAuthorization()
  const canCreate = canEditApplication()

  return (
    <div className="flex flex-col gap-4">
      <Title element="h1" className="text-4xl">
        Opptak
      </Title>

      <ApplicationTable
        applicationPeriods={applicationPeriods}
        isLoading={isLoading}
        actions={
          <PermissionTooltip allowed={canCreate}>
            <Button
              variant="default"
              size="lg"
              element={Link}
              href="/admin/opptak/ny"
              icon={<IconPencil />}
              disabled={!canCreate}
            >
              Opprett opptak
            </Button>
          </PermissionTooltip>
        }
      />
    </div>
  )
}
