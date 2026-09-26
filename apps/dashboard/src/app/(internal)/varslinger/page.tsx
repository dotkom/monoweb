"use client"

import { useAuthorization } from "@/auth/authorization-context"
import { isCommitteeAffiliation } from "@/auth/permissions"
import { PermissionTooltip } from "@/components/PermissionTooltip"
import { Button, Title, ToggleGroup, ToggleGroupItem } from "@dotkomonline/ui"
import { useRouter, useSearchParams } from "next/navigation"
import { useMemo, useState } from "react"
import { NotificationsTable } from "./components/NotificationsTable"
import { SendNotificationModal } from "./components/SendNotificationModal"
import { useNotificationsInfiniteQuery } from "./queries"

type ScopeFilter = "alle" | "mine"

function parseScopeFilter(value: string | null): ScopeFilter {
  if (value === "mine") {
    return "mine"
  }

  return "alle"
}

export default function NotificationsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isAdministrator, affiliations } = useAuthorization()
  const committeeSlugs = useMemo(() => [...affiliations.keys()].filter(isCommitteeAffiliation), [affiliations])
  const canUseMineFilter = !isAdministrator && committeeSlugs.length > 0
  const scopeFilterFromQuery = parseScopeFilter(searchParams.get("scope"))
  const scopeFilter = canUseMineFilter ? scopeFilterFromQuery : "alle"
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  const handleScopeFilterChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("scope", value)
    router.replace(`/varslinger?${params.toString()}`)
  }

  const filters = useMemo(() => {
    if (scopeFilter === "mine" && !isAdministrator && committeeSlugs.length > 0) {
      return { byActorGroupId: committeeSlugs }
    }

    return {}
  }, [committeeSlugs, isAdministrator, scopeFilter])

  const { notifications, isLoading, isPlaceholderData, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useNotificationsInfiniteQuery(filters)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <Title element="h1">Varslinger</Title>
          {canUseMineFilter && (
            <ToggleGroup
              multiple={false}
              value={[scopeFilter]}
              onValueChange={(next) => {
                const value = next.at(0)

                if (value) {
                  handleScopeFilterChange(value)
                }
              }}
            >
              <ToggleGroupItem value="alle">Alle</ToggleGroupItem>
              <ToggleGroupItem value="mine">Mine</ToggleGroupItem>
            </ToggleGroup>
          )}
        </div>
        <PermissionTooltip allowed={isAdministrator} label="Kun administratorer kan opprette varslinger">
          <Button onClick={() => setIsCreateOpen(true)} disabled={!isAdministrator}>
            Ny varsling
          </Button>
        </PermissionTooltip>
      </div>

      <NotificationsTable
        notifications={notifications}
        showLinkType
        showReadPercentage={false}
        dimReadOnlyRows={scopeFilter === "alle"}
        isLoading={isLoading}
        isPlaceholderData={isPlaceholderData}
        isFetchingNextPage={isFetchingNextPage}
        hasNextPage={hasNextPage}
        fetchNextPage={fetchNextPage}
      />

      {isAdministrator && (
        <SendNotificationModal open={isCreateOpen} onOpenChange={setIsCreateOpen} source={{ kind: "GLOBAL" }} />
      )}
    </div>
  )
}
