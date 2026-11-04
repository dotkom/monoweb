"use client"

import { Button, Text, Title } from "@dotkomonline/ui"
import { IconCheck } from "@tabler/icons-react"
import Link from "next/link"
import { NotificationDraftSend } from "../../components/NotificationDraftSend"
import { useNotificationDetailsContext } from "../provider"

export default function NotificationSendPage() {
  const { notification } = useNotificationDetailsContext()

  if (notification.status === "SENT") {
    return (
      <section className="flex max-w-2xl flex-col gap-4">
        <div className="flex items-center gap-2">
          <IconCheck className="size-5 text-green-600 dark:text-green-400" aria-hidden />
          <Title element="h2" size="md">
            Varslingen er sendt
          </Title>
        </div>
        <Text className="text-sm text-muted-foreground">
          Se mottakerlisten for oversikt over hvem som har mottatt varslingen.
        </Text>
        <Button
          element={Link}
          href={`/admin/varslinger/${notification.id}/mottakere`}
          variant="secondary"
          className="w-fit"
        >
          Se mottakere
        </Button>
      </section>
    )
  }

  return <NotificationDraftSend />
}
