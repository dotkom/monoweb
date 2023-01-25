"use client"

import { Title, Text, Table, TableHead, TableRow, TableBody, TableHeaderCell, TableCell, Button } from "@tremor/react"

import { useFlyout } from "../../components/Flyout"
import { useModal } from "../../components/Modal"
import { EventCreationModal } from "./EventCreationModal"
import { EventDetailsFlyout } from "./EventDetailsFlyout"
import { trpc } from "../../trpc"
import { Event } from "@dotkomonline/types"

export default function EventPage() {
  const { Flyout, open: openDetailsFlyout } = useFlyout<Event>(EventDetailsFlyout)
  const { Modal, open: openCreationModal } = useModal(EventCreationModal)

  const { data = [], isLoading } = trpc.event.all.useQuery({ offset: 0, limit: 50 })
  // TODO: use tanstack table

  return (
    <div className="flex w-full flex-col gap-4 p-6">
      <Flyout />
      <Modal />
      <div>
        <Title>Arrangmenter</Title>
        <Text>Lorem ipsum dolor sit amet, consetetur sadipscing elitr.</Text>
      </div>
      <div className="rounded bg-white shadow">
        {isLoading ? (
          "Loading"
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Arrangement</TableHeaderCell>
                <TableHeaderCell>Startdato</TableHeaderCell>
                <TableHeaderCell>Sluttdato</TableHeaderCell>
                <TableHeaderCell>Arrangør</TableHeaderCell>
                <TableHeaderCell>Type</TableHeaderCell>
                <TableHeaderCell>Plasser</TableHeaderCell>
                <TableHeaderCell>Detaljer</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((event) => (
                <TableRow key={event.id}>
                  <TableCell>{event.title}</TableCell>
                  <TableCell>{event.start.toLocaleTimeString()}</TableCell>
                  <TableCell>{event.end.toLocaleTimeString()}</TableCell>
                  <TableCell>{event.committeeID ?? "Ingen"}</TableCell>
                  <TableCell>{event.type}</TableCell>
                  <TableCell>0/0</TableCell>
                  <TableCell>
                    <Button text="Endre" importance="secondary" handleClick={() => openDetailsFlyout(event)} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <Button text="Opprett nytt arrangement" handleClick={openCreationModal} />
    </div>
  )
}
