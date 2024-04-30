import { trpc } from "@/utils/trpc/client"

interface Props {
  userId?: string
  attendanceId: string
}
export const useGetAttendee = ({ userId, attendanceId }: Props) => {
  return trpc.event.attendance.getAttendee.useQuery(
    {
      attendanceId,
      userId: userId ?? "",
    },
    {
      enabled: Boolean(userId),
    }
  )
}
