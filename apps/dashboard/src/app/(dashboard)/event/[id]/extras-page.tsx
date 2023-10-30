import { Box, Button, Title } from "@mantine/core"
import { FC } from "react"
import { useCreateEventExtrasModal } from "../../../../modules/event/modals/create-event-extras-modal"
import { useEditEventMutation } from "../../../../modules/event/mutations/use-edit-event-mutation"
import { useEventDetailsContext } from "./provider"

export const ExtrasPage: FC = () => {
  const { event } = useEventDetailsContext()

  const open = useCreateEventExtrasModal({
    id: event.id,
    event: event,
  })

  const edit = useEditEventMutation()

  const deleteAlternative = (id: string) => {
    const newChoices = event.extrasChoice?.filter((alt) => alt.id !== id)
    edit.mutate({
      id: event.id,
      event: {
        ...event,
        extrasChoice: newChoices ?? [],
      },
    })
  }

  return (
    <Box>
      <Title order={3}>Valg</Title>
      {event.extrasChoice === null && <p>Ingen ekstra valg er lagt til</p>}

      <Button onClick={open}>Legg til nytt valg</Button>
      {/* display message if no choices */}

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
