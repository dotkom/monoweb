"use client"

import { Button, Group, Skeleton, Stack, Text, Title } from "@mantine/core"
import { IconPencil } from "@tabler/icons-react"
import Link from "next/link"
import { FadderukerTable } from "./components/fadderuker-table"
import { useFadderukeFindManyQuery } from "./queries"

export default function FadderukenePage() {
  const { fadderuker, isLoading } = useFadderukeFindManyQuery()

  return (
    <Stack>
      <Title order={1}>Fadderukene</Title>

      <Text c="dimmed">Knytt et hovedarrangementet til en fadderuke.</Text>

      <Group>
        <Button component={Link} href="/fadderukene/ny" leftSection={<IconPencil width={14} height={14} />}>
          Opprett fadderuke
        </Button>
      </Group>

      <Skeleton visible={isLoading}>
        <FadderukerTable fadderuker={fadderuker} />
      </Skeleton>
    </Stack>
  )
}
