"use client"

import { useAuthorization } from "@/auth/authorization-context"
import { isCommitteeAffiliation } from "@/auth/permissions"
import { Button, Title, ToggleGroup, ToggleGroupItem } from "@dotkomonline/ui"
import { useRouter, useSearchParams } from "next/navigation"
import { useMemo, useState } from "react"
import { NotificationsTable } from "./components/notifications-table"
import { SendNotificationModal } from "./components/send-notification-modal"
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

  const { notifications, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } =
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
        <Button type="button" onClick={() => setIsCreateOpen(true)}>
          Ny varsling
        </Button>
      </div>

      {isLoading ? (
        <div className="h-40 w-full animate-pulse rounded-sm bg-muted" />
      ) : (
        <NotificationsTable
          notifications={notifications}
          showLinkType
          showReadPercentage={false}
          dimReadOnlyRows={scopeFilter === "alle"}
        />
      )}

      {hasNextPage && (
        <Button variant="secondary" disabled={isFetchingNextPage} onClick={() => fetchNextPage()}>
          Last inn flere
        </Button>
      )}

      <SendNotificationModal open={isCreateOpen} onOpenChange={setIsCreateOpen} source={{ kind: "GLOBAL" }} />
    </div>
  )
}
