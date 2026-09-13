import {
  getEventRequestStatus,
  mapEventRequestStatusToLabel,
  type EventRequestWithEvent,
} from "@dotkomonline/rpc/event"
import { Button, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@dotkomonline/ui"
import { IconEye } from "@tabler/icons-react"
import { formatDate } from "date-fns"

interface Props {
  eventRequests: EventRequestWithEvent[]
}

export const EventRequestTable = ({ eventRequests }: Props) => {
  const format = (date: Date) => formatDate(date, "dd. MMM yyyy 'kl.' HH:mm")

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Tittel</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Opprettet</TableHead>
          <TableHead>Oppdatert</TableHead>
          <TableHead>Handling</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {eventRequests.map((eventRequest) => (
          <TableRow key={eventRequest.id}>
            <TableCell>{eventRequest.event.title}</TableCell>
            <TableCell>{getEventRequestStatusLabel(eventRequest, format)}</TableCell>
            <TableCell>{format(eventRequest.createdAt)}</TableCell>
            <TableCell>{format(eventRequest.updatedAt)}</TableCell>
            <TableCell>
              <Button variant="outline">
                <IconEye />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

const getEventRequestStatusLabel = (eventRequest: EventRequestWithEvent, format: (date: Date) => string) => {
  const status = getEventRequestStatus(eventRequest)
  const statusLabel = mapEventRequestStatusToLabel(status)

  if (status === "REJECTED") {
    return `${statusLabel} ${eventRequest.rejectedAt ? format(eventRequest.rejectedAt) : ""}`
  }

  return statusLabel
}
