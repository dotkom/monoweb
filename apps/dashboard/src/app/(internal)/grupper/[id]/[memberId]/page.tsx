"use client"

import { ReadOnlyNotice } from "@/components/ReadOnlyNotice"
import { useGroupPermissions } from "@/hooks/use-group-permissions"
import { CloseButton, Group, Stack, Tabs, Title } from "@mantine/core"
import { IconListDetails } from "@tabler/icons-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useGroupDetailsContext } from "../provider"
import { GroupMemberEditCard } from "./edit-card"
import { useGroupMemberDetailsContext } from "./provider"

const SIDEBAR_LINKS = [
  {
    icon: IconListDetails,
    label: "Info",
    slug: "info",
    component: GroupMemberEditCard,
  },
] as const

export default function GroupMemberDetailsPage() {
  const router = useRouter()
  const { group } = useGroupDetailsContext()
  const { groupMember } = useGroupMemberDetailsContext()
  const { canManageMembership } = useGroupPermissions()

  const searchParams = useSearchParams()
  const currentTab = searchParams.get("tab") || SIDEBAR_LINKS[0].slug

  const handleTabChange = (value: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("tab", value ?? SIDEBAR_LINKS[0].slug)
    router.replace(`/grupper/${group.slug}/${groupMember.id}?${params.toString()}`)
  }

  return (
    <Stack>
      <Group>
        <CloseButton onClick={() => router.back()} />
        <Title>Oppdater medlemskap</Title>
      </Group>

      {!canManageMembership && (
        <ReadOnlyNotice
          title="Du kan ikke redigere gruppemedlemskapet."
          message="Dette er fordi du ikke er leder eller nestleder av gruppen. Kontakt dotkom dersom du mener dette er en feil."
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
