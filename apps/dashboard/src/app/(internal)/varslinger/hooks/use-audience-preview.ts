import { isTrpcErrorCode } from "@/lib/trpc-errors"
import { useTRPC } from "@/lib/trpc-client"
import {
  NotificationAudienceSchema,
  type NotificationAudience,
  type NotificationType,
} from "@dotkomonline/rpc/notification"
import { useDebouncedValue } from "@mantine/hooks"
import { skipToken, useQuery } from "@tanstack/react-query"

const PREVIEW_DEBOUNCE_MS = 400

function parseSerializedAudience(serializedAudience: string | null): NotificationAudience | null {
  if (serializedAudience === null) {
    return null
  }

  const parsedJson: unknown = JSON.parse(serializedAudience)
  const parsedAudience = NotificationAudienceSchema.safeParse(parsedJson)

  if (!parsedAudience.success) {
    return null
  }

  return parsedAudience.data
}

export function useAudiencePreview(audience: NotificationAudience | null, type: NotificationType) {
  const trpc = useTRPC()
  const serializedAudience = audience === null ? null : JSON.stringify(audience)
  const [debouncedSerializedAudience] = useDebouncedValue(serializedAudience, PREVIEW_DEBOUNCE_MS)
  const parsedAudience = parseSerializedAudience(debouncedSerializedAudience)
  const previewInput = parsedAudience === null ? skipToken : { audience: parsedAudience, type }

  const query = useQuery({
    ...trpc.notification.previewAudience.queryOptions(previewInput),
    retry: false,
  })

  const isDebouncing = serializedAudience !== debouncedSerializedAudience
  const isForbidden = isTrpcErrorCode(query.error, "FORBIDDEN")

  return {
    preview: query.data,
    isPending: serializedAudience === null || isDebouncing || query.isFetching,
    isForbidden,
  }
}
