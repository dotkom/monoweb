import { FC } from "react"
import { useEventDetailsContext } from "./EventDetailsModal"
import { useAutoForm } from "../../autoform/form"
import { EventWriteSchema } from "@dotkomonline/types"

export const EventDetailsCommittees: FC = () => {
  const { event } = useEventDetailsContext()
  useAutoForm({
    schema: EventWriteSchema,
    props: {
      title: {
        withAsterisk: true,
      },
    },
  })
  return <h1>Committees for {event.title}</h1>
}
