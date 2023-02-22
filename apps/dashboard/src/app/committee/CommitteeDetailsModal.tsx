import { Modal } from "@mantine/core"
import { FC } from "react"
import { Committee } from "@dotkomonline/types"

export type CommitteeDetailsModalProps = {
  committee: Committee
  close: () => void
}

export const CommitteeDetailsModal: FC<CommitteeDetailsModalProps> = ({ committee, close }) => {
  return (
    <Modal centered title={committee.name} opened onClose={close}>
      Hello world
    </Modal>
  )
}
