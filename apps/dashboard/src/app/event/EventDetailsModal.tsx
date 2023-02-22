import { Modal } from "@mantine/core"
import { FC } from "react"
import { Event } from "@dotkomonline/types"

export type EventDetailsModalProps = {
  event: Event
  close: () => void
}

export const EventDetailsModal: FC<EventDetailsModalProps> = ({ event, close }) => {
  return (
    <Modal centered title={event.title} opened onClose={close}>
      Hello world
    </Modal>
  )
}
