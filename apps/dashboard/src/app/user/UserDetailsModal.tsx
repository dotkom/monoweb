import { Modal } from "@mantine/core"
import { FC } from "react"
import { User } from "@dotkomonline/types"

export type UserDetailsModalProps = {
  user: User
  close: () => void
}

export const UserDetailsModal: FC<UserDetailsModalProps> = ({ user, close }) => {
  return (
    <Modal centered title={user.id} opened onClose={close}>
      Hello world
    </Modal>
  )
}
