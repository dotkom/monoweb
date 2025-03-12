import { useTRPC } from "@/utils/trpc/client"
import { skipToken } from "@tanstack/react-query"

import { useQuery } from "@tanstack/react-query"

interface Props {
  userId?: string
  attendanceId: string
}
export const useGetAttendee = ({ userId, attendanceId }: Props) => {
  const trpc = useTRPC()
  return useQuery(
    trpc.event.attendance.getAttendee.queryOptions(
      userId
        ? {
            attendanceId,
            userId: userId ?? "",
          }
        : skipToken
    )
  )
}
