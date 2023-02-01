import { FC, useState } from "react"
import {
  EuiButton,
  EuiSpacer,
  EuiPageHeader,
  EuiModal,
  EuiModalHeader,
  EuiModalHeaderTitle,
  EuiModalBody,
  EuiText,
} from "@elastic/eui"
import { EventListingTable } from "./EventListingTable"
import { EventCreationModal } from "./EventCreationModal"

export const EventPage: FC = () => {
  const [isCreationModalVisible, setCreationModalVisible] = useState(false)
  let modal = null
  if (isCreationModalVisible) {
    modal = <EventCreationModal onClose={() => setCreationModalVisible(false)} />
  }

  return (
    <>
      <EuiPageHeader
        pageTitle="Arrangementer"
        description="Her finner du en liste over eksisterende arrangementer, samt muligheter for å endre og lage nye."
      />
      <EuiSpacer size="m" />
      <EventListingTable />
      <EuiSpacer size="m" />
      <div>
        <EuiButton onClick={() => setCreationModalVisible(true)}>Opprett nytt arrangement</EuiButton>
      </div>
      {modal}
    </>
  )
}
