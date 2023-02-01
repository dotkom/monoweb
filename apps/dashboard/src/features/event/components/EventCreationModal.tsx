import { FC } from "react"
import { EuiModal, EuiModalHeader, EuiModalHeaderTitle, EuiModalBody, EuiText } from "@elastic/eui"

export type EventCreationModalProps = {
  onClose: () => void
}

export const EventCreationModal: FC<EventCreationModalProps> = ({ onClose }) => {
  return (
    <>
      <h1>Wtf</h1>
      <EuiModal onClose={onClose}>
        <EuiModalHeader>
          <EuiModalHeaderTitle>Opprett nytt arrangement</EuiModalHeaderTitle>
        </EuiModalHeader>
        <EuiModalBody>
          <EuiText>Hello world</EuiText>
        </EuiModalBody>
      </EuiModal>
    </>
  )
}
