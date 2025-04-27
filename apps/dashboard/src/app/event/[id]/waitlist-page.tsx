import type { Attendance } from "@dotkomonline/types"
import type { FC } from "react"
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
  return <div>TODO</div>
}
