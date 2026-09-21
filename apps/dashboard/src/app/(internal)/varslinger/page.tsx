"use client"

import { useAuthorization } from "@/auth/authorization-context"
import { isCommitteeAffiliation } from "@/auth/permissions"
import { Button, Group, SegmentedControl, Skeleton, Stack, Title } from "@mantine/core"
import { useRouter, useSearchParams } from "next/navigation"
import { useMemo } from "react"
import { openSendNotificationModal } from "./components/send-notification-modal"
import { NotificationsTable } from "./components/notifications-table"
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
    <Stack>
      <Group justify="space-between" align="flex-end" wrap="wrap">
        <Group>
          <Title order={1}>Varslinger</Title>

          {canUseMineFilter && (
            <SegmentedControl
              value={scopeFilter}
              onChange={handleScopeFilterChange}
              data={[
                { label: "Alle", value: "alle" },
                { label: "Mine", value: "mine" },
              ]}
            />
          )}
        </Group>

        <Button onClick={() => openSendNotificationModal({ kind: "GLOBAL" })}>Ny varsling</Button>
      </Group>

      <Skeleton visible={isLoading}>
        <NotificationsTable
          notifications={notifications}
          showLinkType
          showReadPercentage={false}
          dimReadOnlyRows={scopeFilter === "alle"}
        />
      </Skeleton>

      {hasNextPage && (
        <Button variant="default" onClick={() => fetchNextPage()} loading={isFetchingNextPage}>
          Last inn flere
        </Button>
      )}
    </Stack>
  )
}
