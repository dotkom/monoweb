import { User, type Attendance } from "@dotkomonline/types"
import { Box, Divider, Title } from "@mantine/core"
import { type FC } from "react"
import { useEventDetailsContext } from "./provider"
import { UserSearch } from "../../../../components/molecules/UserSearch/UserSearch"
import { AllAttendeesTable } from "../all-users-table"
import { useEventAttendeesGetQuery } from "../../../../modules/attendance/queries/use-get-queries"
import { useRegisterForEventMutation } from "../../../../modules/attendance/mutations/use-attendee-mutations"

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
  return <div>TODO</div>
}
