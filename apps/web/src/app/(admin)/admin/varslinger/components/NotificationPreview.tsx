"use client"

import { NotificationItem } from "@/components/Navbar/NotificationItem"
import { NotificationPayload } from "@/components/Navbar/NotificationPayload"
import { TRPCProvider } from "@/utils/trpc/client"
import { useTRPCClient } from "@admin/lib/trpc-client"
import type { NotificationManagement } from "@dotkomonline/rpc/notification"
import { Card, Text } from "@dotkomonline/ui"
import { useQueryClient } from "@tanstack/react-query"

export function NotificationPreview({ notification }: { notification: NotificationManagement }) {
  const trpcClient = useTRPCClient()
  const queryClient = useQueryClient()

  return (
    <Card className="px-4">
      <Text className="text-xs font-medium text-muted-foreground">Forhåndsvisning</Text>
      <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
        <div className="max-w-96" inert>
          <NotificationItem notification={notification} readAt={null}>
            <NotificationPayload notification={notification} />
          </NotificationItem>
        </div>
      </TRPCProvider>
    </Card>
  )
}
