import { trpc } from "@/utils/trpc"

interface Props {
  userId: string
  attendanceId: string
}
export const useGetAttendee = ({ userId, attendanceId }: Props) => {
  return trpc.event.attendance.getAttendee.useQuery({
    attendanceId,
    userId,
  })
}
