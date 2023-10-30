import { Box, Button, Paper, Title } from "@mantine/core"
import { FC } from "react"
import {
  useCreateEventExtrasModal,
  useEditEventExtrasModal,
} from "../../../../modules/event/modals/create-event-extras-modal"
import { useEditEventMutation } from "../../../../modules/event/mutations/use-edit-event-mutation"
import { useEventDetailsContext } from "./provider"

export const ExtrasPage: FC = () => {
  const { event } = useEventDetailsContext()

  const openCreate = useCreateEventExtrasModal({
    event: event,
  })

  const openEdit = useEditEventExtrasModal({
    event: event,
  })

  const edit = useEditEventMutation()

  const deleteAlternative = (id: string) => {
    const newChoices = event.attendeeQuestions?.filter((alt) => alt.id !== id)
    edit.mutate({
      id: event.id,
      event: {
        ...event,
        attendeeQuestions: newChoices ?? [],
      },
    })
  }

  return (
    <Box>
      <Title order={3}>Valg</Title>
      {!event.attendeeQuestions?.length && <p>Ingen valg er lagt til</p>}

      <Button onClick={openCreate}>Legg til nytt valg</Button>

      {event.attendeeQuestions?.map((extra) => (
        <Paper key={extra.id} withBorder p={"md"} mt={"md"}>
          <Button mr={"sm"} color="yellow" onClick={() => openEdit(extra)}>
            Endre
          </Button>
          <Button color="red" onClick={() => deleteAlternative(extra.id)}>
            Slett
          </Button>
          <h3>{extra.name}</h3>
          {extra.choices.map((choice) => (
            <div key={choice.id}>
              <p>{choice.name}</p>
            </div>
          ))}
        </Paper>
      ))}
    </Box>
  )
}
