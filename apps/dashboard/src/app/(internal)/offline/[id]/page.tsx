"use client"

import { useAuthorization } from "@/auth/authorization-context"
import { ReadOnlyNotice } from "@/components/ReadOnlyNotice"
import { CloseButton, Group, Stack, Tabs, Title } from "@mantine/core"
import { IconBuildingWarehouse } from "@tabler/icons-react"
import { useRouter, useSearchParams } from "next/navigation"
import { OfflineEditCard } from "./edit-card"
import { useOfflineDetailsContext } from "./provider"

const SIDEBAR_LINKS = [
  {
    icon: IconBuildingWarehouse,
    label: "Info",
    slug: "info",
    component: OfflineEditCard,
  },
] as const

export default function OfflineDetailsPage() {
  const { offline } = useOfflineDetailsContext()
  const { canEditOffline } = useAuthorization()
  const canEdit = canEditOffline()
  const router = useRouter()

  const searchParams = useSearchParams()
  const currentTab = searchParams.get("tab") || SIDEBAR_LINKS[0].slug

  const handleTabChange = (value: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("tab", value ?? SIDEBAR_LINKS[0].slug)
    router.replace(`/offline/${offline.id}?${params.toString()}`)
  }

  return (
    <Stack>
      <Group>
        <CloseButton onClick={() => router.back()} />
        <Title>{offline.title}</Title>
      </Group>

      {!canEdit && (
        <ReadOnlyNotice
          title="Du kan ikke redigere Offline-utgaven."
          message="Dette er fordi du ikke er leder, nestleder eller redaktør i Prokom. Kontakt dotkom dersom du mener dette er en feil."
        />
      )}

      <Tabs defaultValue={currentTab} onChange={handleTabChange}>
        <Tabs.List>
          {SIDEBAR_LINKS.map(({ label, icon: Icon, slug }) => (
            <Tabs.Tab key={slug} value={slug} leftSection={<Icon width={14} height={14} />}>
              {label}
            </Tabs.Tab>
          ))}
        </Tabs.List>
        {SIDEBAR_LINKS.map(({ slug, component: Component }) => (
          <Tabs.Panel mt="md" key={slug} value={slug}>
            <Component />
          </Tabs.Panel>
        ))}
      </Tabs>
    </Stack>
  )
}
