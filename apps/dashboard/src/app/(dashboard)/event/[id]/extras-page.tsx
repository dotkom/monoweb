import { Attendance, Attendee } from "@dotkomonline/types"
import { Box, Button, Title } from "@mantine/core"
import { createColumnHelper, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import { FC, useMemo, useState } from "react"
import { useEventAttendanceGetQuery } from "src/modules/event/queries/use-event-attendance-get-query"
import { useEventDetailsContext } from "./provider"
import { useCreateEventExtrasModal } from "../../../../modules/event/modals/create-event-extras-modal"
import { useEditEventMutation } from "../../../../modules/event/mutations/use-edit-event-mutation"

export const ExtrasPage: FC = () => {
  const { event } = useEventDetailsContext()

  const open = useCreateEventExtrasModal({
    id: event.id,
    event: event,
  })

  const edit = useEditEventMutation()

  const deleteAlternative = (id: string) => {
    console.log(id)
    console.log(event.extrasChoice)
    const newChoices = event.extrasChoice?.filter((alt) => alt.id !== id)
    console.log(newChoices)
    edit.mutate({
      id: event.id,
      event: {
        ...event,
        extrasChoice: newChoices ?? [],
      },
    })
  }

  console.log(event)

  return (
    <Box>
      <Title order={3}>Valg</Title>

      <Button onClick={open}>Legg till nytt valg</Button>
      {event.extrasChoice?.map((extra) => (
        <div key={extra.id}>
          <hr></hr>
          <Button color="red" onClick={() => deleteAlternative(extra.id)}>
            Slett
          </Button>
          <h3>{extra.name}</h3>
          {extra.choices.map((choice) => (
            <div key={choice.id}>
              <p>{choice.name}</p>
            </div>
          ))}
        </div>
      ))}
    </Box>
  )
}
