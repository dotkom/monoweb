"use client"

import { FC } from "react"
import { Tabs } from "@radix-ui/themes"
import { useRouter } from "next/navigation"

export const TabMenu: FC = () => {
  const router = useRouter()
  return (
    <Tabs.Root defaultValue="events">
      <Tabs.List>
        <Tabs.Trigger onClick={() => router.push("/event")} value="events">
          Arrangementer
        </Tabs.Trigger>
        <Tabs.Trigger onClick={() => router.push("/company")} value="companies">
          Bedrifter
        </Tabs.Trigger>
        <Tabs.Trigger onClick={() => router.push("/committee")} value="committees">
          Komiteer
        </Tabs.Trigger>
        <Tabs.Trigger onClick={() => router.push("/user")} value="users">
          Brukere
        </Tabs.Trigger>
      </Tabs.List>
    </Tabs.Root>
  )
}
