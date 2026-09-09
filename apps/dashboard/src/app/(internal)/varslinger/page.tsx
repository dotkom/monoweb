"use client"

import { useAuthorization } from "@/auth/authorization-context"
import { isCommitteeAffiliation } from "@/auth/permissions"
import { Button, Group, Skeleton, Stack, Switch, Title } from "@mantine/core"
import { useMemo, useState } from "react"
import { openSendNotificationModal } from "./components/send-notification-modal"
import { NotificationsTable } from "./components/notifications-table"
import { useNotificationsInfiniteQuery } from "./queries"

export default function NotificationsPage() {
  const { isAdministrator, affiliations } = useAuthorization()
  const [showAll, setShowAll] = useState(false)
  const committeeSlugs = useMemo(() => [...affiliations.keys()].filter(isCommitteeAffiliation), [affiliations])

  const filters = useMemo(() => {
    if (isAdministrator && showAll) {
      return {}
    }

    return { byActorGroupId: committeeSlugs }
  }, [committeeSlugs, isAdministrator, showAll])

  const { notifications, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useNotificationsInfiniteQuery(filters)

  return (
    <Stack>
      <Group justify="space-between" align="flex-end" wrap="wrap">
        <Title order={1}>Varslinger</Title>
        <Group>
          {isAdministrator && (
            <Switch
              label="Vis alle (inkl. automatiske)"
              checked={showAll}
              onChange={(event) => setShowAll(event.currentTarget.checked)}
            />
          )}
          <Button onClick={() => openSendNotificationModal({ kind: "GLOBAL" })}>Ny varsling</Button>
        </Group>
      </Group>

      <Skeleton visible={isLoading}>
        <NotificationsTable notifications={notifications} showLinkType showReadPercentage={false} />
      </Skeleton>

      {hasNextPage && (
        <Button variant="default" onClick={() => fetchNextPage()} loading={isFetchingNextPage}>
          Last inn flere
        </Button>
      )}
    </Stack>
  )
}
