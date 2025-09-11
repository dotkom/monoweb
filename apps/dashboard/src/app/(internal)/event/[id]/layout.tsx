"use client"

import { Anchor, Box, Group, Loader, Text } from "@mantine/core"
import { IconAlertTriangleFilled } from "@tabler/icons-react"
import { usePathname, useSearchParams } from "next/navigation"
import { type PropsWithChildren, use } from "react"
import { useEventWithAttendancesGetQuery } from "../queries"
import { EventContext } from "./provider"

export default function EventWithAttendancesLayout({
  children,
  params,
}: PropsWithChildren<{ params: Promise<{ id: string }> }>) {
  const { id } = use(params)
  const { data, isLoading } = useEventWithAttendancesGetQuery(id)
  const pathname = usePathname()
  const searchParams = useSearchParams()

  if (data === undefined || isLoading) {
    return <Loader />
  }

  const hasAttendance = Boolean(data.attendance)
  const hasPools = Boolean(data.attendance?.pools && data.attendance.pools.length > 0)

  const urlSearchParams = new URLSearchParams(searchParams.toString())
  urlSearchParams.set("tab", "pamelding")
  const href = `${pathname}?${urlSearchParams.toString()}`

  return (
    <EventContext.Provider value={data}>
      {hasAttendance && !hasPools && (
        <Box p="md" style={{ borderRadius: "var(--mantine-radius-md)" }} bg="red.7" mb="lg">
          <Anchor href={href} underline="never">
            <Group gap="xs">
              <IconAlertTriangleFilled color="white" size={24} />
              <Text c="white" size="lg">
                Påmeldingen har ingen påmeldingsgrupper
              </Text>
            </Group>
          </Anchor>
        </Box>
      )}
      {children}
    </EventContext.Provider>
  )
}
