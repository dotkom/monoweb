import { Icon } from "@iconify/react"
import { ActionIcon, Box, Button, Paper, Title } from "@mantine/core"
import { type FC } from "react"
import { useEventDetailsContext } from "./provider"
import { useCreateEventExtrasModal } from "../../../../modules/event/modals/create-event-extras-modal"
import { useEditEventExtrasModal } from "../../../../modules/event/modals/edit-event-extras-modal"
import { useEditEventMutation } from "../../../../modules/event/mutations/use-edit-event-mutation"

export const ExtrasPage: FC = () => {
  const { event } = useEventDetailsContext()

  const openCreate = useCreateEventExtrasModal({
    event,
  })

  const openEdit = useEditEventExtrasModal({
    event,
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
            <ActionIcon variant="outline" onClick={() => openEdit(extra)} mr="md">
              <Icon icon="tabler:edit" />
            </ActionIcon>
            <ActionIcon variant="outline" onClick={() => deleteAlternative(extra.id)} color="red">
              <Icon icon="tabler:trash" />
            </ActionIcon>
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
