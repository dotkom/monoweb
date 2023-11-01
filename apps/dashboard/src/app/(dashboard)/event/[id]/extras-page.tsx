import { Box, Button, Paper, Title } from "@mantine/core"
import { FC } from "react"
import { useEditEventMutation } from "../../../../modules/event/mutations/use-edit-event-mutation"
import { useEventDetailsContext } from "./provider"
import { useCreateEventExtrasModal } from "../../../../modules/event/modals/create-event-extras-modal"
import { useEditEventExtrasModal } from "../../../../modules/event/modals/edit-event-extras-modal"

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
    const newChoices = event.extras?.filter((alt) => alt.id !== id)
    edit.mutate({
      id: event.id,
      event: {
        ...event,
        extras: newChoices ?? [],
      },
    })
  }

  return (
    <Box>
      <Title order={3}>Valg</Title>
      {!event.extras?.length && <p>Ingen valg er lagt til</p>}
      <Box>
        {event.extras?.map((extra) => (
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

      <Button mt="md" onClick={openCreate}>
        Legg til nytt valg
      </Button>
    </Box>
  )
}
