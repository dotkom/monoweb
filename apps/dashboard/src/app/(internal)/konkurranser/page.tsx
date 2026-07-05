"use client"

import { useAuthorization } from "@/auth/authorization-context"
import { PermissionTooltip } from "@/components/PermissionTooltip"
import { Button, Group, Skeleton, Stack, TextInput, Title } from "@mantine/core"
import { IconPencil, IconSearch } from "@tabler/icons-react"
import Link from "next/link"
import { useState } from "react"
import { ContestsTable } from "./components/contests-table"
import { useContestFindManyQuery } from "./queries"

export default function ContestPage() {
  const { contests, isLoading } = useContestFindManyQuery()
  const [search, setSearch] = useState("")

  const filtered = contests.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()))
  const { canCreateEvents } = useAuthorization()
  const canCreate = canCreateEvents()

  return (
    <Stack>
      <Title order={1}>Konkurranser</Title>

      <Group justify="space-between">
        <TextInput
          placeholder="Søk etter konkurranse..."
          leftSection={<IconSearch width={14} height={14} />}
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
        />

        <PermissionTooltip allowed={canCreate}>
          <Button
            component={Link}
            href="/konkurranser/ny"
            leftSection={<IconPencil width={14} height={14} />}
            disabled={!canCreate}
          >
            Opprett konkurranse
          </Button>
        </PermissionTooltip>
      </Group>

      <Skeleton visible={isLoading}>
        <ContestsTable contests={filtered} />
      </Skeleton>
    </Stack>
  )
}
