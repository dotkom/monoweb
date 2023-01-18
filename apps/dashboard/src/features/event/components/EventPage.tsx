import { Title, Text, Table, TableHead, TableRow, TableBody, TableHeaderCell, TableCell, Button } from "@tremor/react"
import { FC } from "react"

import { useFlyout } from "../../../components/Flyout"
import { useModal } from "../../../components/Modal"
import { EventCreationModal } from "./EventCreationModal"
import { EventDetailsFlyout } from "./EventDetailsFlyout"

export const EventPage: FC = () => {
  const { Flyout, open: openDetailsFlyout } = useFlyout(EventDetailsFlyout)
  const { Modal, open: openCreationModal } = useModal(EventCreationModal)

  return (
    <div className="flex w-full flex-col gap-4 p-6">
      <Flyout />
      <Modal />
      <div>
        <Title>Arrangmenter</Title>
        <Text>Lorem ipsum dolor sit amet, consetetur sadipscing elitr.</Text>
      </div>
      <div className="rounded bg-white shadow">
        <Table>
          <TableHead>
            <TableHeaderCell>Arrangement</TableHeaderCell>
            <TableHeaderCell>Startdato</TableHeaderCell>
            <TableHeaderCell>Sluttdato</TableHeaderCell>
            <TableHeaderCell>Arrangør</TableHeaderCell>
            <TableHeaderCell>Type</TableHeaderCell>
            <TableHeaderCell>Plasser</TableHeaderCell>
            <TableHeaderCell>Konfigurer</TableHeaderCell>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>Åre</TableCell>
              <TableCell>2022-01-01</TableCell>
              <TableCell>2022-01-05</TableCell>
              <TableCell>Arrkom</TableCell>
              <TableCell>Sosialt</TableCell>
              <TableCell>25/150</TableCell>
              <TableCell>
                <Button text="Endre" importance="secondary" handleClick={openDetailsFlyout} />
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      <Button text="Opprett nytt arrangement" handleClick={openCreationModal} />
    </div>
  )
}
