"use client"

import { useFlyout } from "../../components/Flyout"
import { useModal } from "../../components/Modal"
import { EventCreationModal } from "./EventCreationModal"
import { EventDetailsFlyout } from "./EventDetailsFlyout"
import { trpc } from "../../trpc"
import { Event } from "@dotkomonline/types"
import { Button } from "@dotkomonline/ui"

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
        <h1>Arrangmenter</h1>
        <p>Lorem ipsum dolor sit amet, consetetur sadipscing elitr.</p>
      </div>
      <div className="rounded bg-white shadow">
        {isLoading ? (
          "Loading"
        ) : (
          <table>
            <thead>
              <tr>
                <td>Arrangement</td>
                <td>Startdato</td>
                <td>Sluttdato</td>
                <td>Arrangør</td>
                <td>Type</td>
                <td>Plasser</td>
                <td>Detaljer</td>
              </tr>
            </thead>
            <tbody>
              {data.map((event) => (
                <tr key={event.id}>
                  <td>{event.title}</td>
                  <td>{event.start.toLocaleTimeString()}</td>
                  <td>{event.end.toLocaleTimeString()}</td>
                  <td>{event.committeeId ?? "Ingen"}</td>
                  <td>{event.type}</td>
                  <td>0/0</td>
                  <td>
                    <Button onClick={() => openDetailsFlyout(event)}>Vis detailjer</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div>
        <Button onClick={openCreationModal}>Opprett nytt arrangement</Button>
      </div>
    </div>
  )
}
