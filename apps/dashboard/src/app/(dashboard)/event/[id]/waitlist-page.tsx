import type { Attendance } from "@dotkomonline/types"
import { Box, Title } from "@mantine/core"
import type { FC } from "react"
import { WaitlistTable } from "../components/waitlist-table"
import { useEventDetailsContext } from "./provider"

export const WaitlistPage: FC = () => {
  const { attendance } = useEventDetailsContext()

  if (!attendance) {
    return <div>Arrangementet har ikke påmelding</div>
  }

  return <Page attendance={attendance} />
}

interface Props {
  attendance: Attendance
}

const Page: FC<Props> = ({ attendance }) => {
  return (
    <Box>
      <Title mb={10} order={3}>
        Venteliste
      </Title>
      <WaitlistTable attendanceId={attendance.id} />
    </Box>
  )
}
