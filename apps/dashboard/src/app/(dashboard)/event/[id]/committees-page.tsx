import { Committee, CommitteeSchema, EventSchema } from "@dotkomonline/types"
import { Icon } from "@iconify/react"
import { Box, Button, Group, Image, Text, Title } from "@mantine/core"
import { createColumnHelper, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import { FC, useMemo } from "react"
import { z } from "zod"
import { GenericTable } from "../../../../components/GenericTable"
import { useCommitteeAllQuery } from "../../../../modules/committee/queries/use-committee-all-query"
import { useAddCommitteeToEventMutation } from "../../../../modules/event/mutations/use-add-committee-to-event-mutation"
import { useRemoveCommitteeFromEventMutation } from "../../../../modules/event/mutations/use-remove-committee-from-event-mutation"
import { useEventCommitteeGetQuery } from "../../../../modules/event/queries/use-event-committee-get-query"
import { createSelectInput, useFormBuilder } from "../../../form"
import { useEventDetailsContext } from "./provider"

export const EventCommitteesPage: FC = () => {
  const { event } = useEventDetailsContext()
  const { eventCommittiees } = useEventCommitteeGetQuery(event.id)
  const { committees } = useCommitteeAllQuery()
  const add = useAddCommitteeToEventMutation()
  const remove = useRemoveCommitteeFromEventMutation()
  const columnHelper = createColumnHelper<Committee>()
  const columns = useMemo(
    () => [
      columnHelper.accessor((eventCommittee) => eventCommittee, {
        id: "eventCommittee",
        header: () => "Navn",
        cell: (info) => {
          const name = committees.find((x) => x.id === info.getValue().id)?.name ?? "Ingen navn"
          const image = info.getValue().image
          return image !== null ? (
            <Group>
              <Image width={40} height={40} fit="contain" src={image} alt="committee logo" />
              {name}
            </Group>
          ) : (
            <Group>
              <Icon width={40} height={40} icon="tabler:user-circle" />
              {name}
            </Group>
          )
        },
      }),
      columnHelper.accessor((eventCommittee) => eventCommittee, {
        id: "actions",
        header: () => "Verktøy",
        cell: (info) => (
          <Button
            variant="outline"
            leftSection={<Icon icon="tabler:trash" />}
            onClick={() => remove.mutate({ id: event.id, committee: info.getValue().id })}
          >
            Fjern
          </Button>
        ),
      }),
    ],
    [committees, columnHelper, remove, event.id]
  )
  const table = useReactTable<Committee>({
    data: eventCommittiees,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })
  const FormComponent = useFormBuilder({
    schema: z.object({
      id: EventSchema.shape.id,
      committee: CommitteeSchema.shape.id,
    }),
    defaultValues: {
      id: event.id,
    },
    fields: {
      committee: createSelectInput({
        label: "Komiténavn",
        data: committees
          .filter((committee) => !eventCommittiees.map((x: { id: unknown }) => x.id).includes(committee.id))
          .map((committee) => ({ label: committee.name, value: committee.id })),
      }),
    },
    label: "Legg til ny komité",
    onSubmit: (data) => {
      add.mutate(data)
    },
  })

  return (
    <Box>
      <Title order={3}>Komiteer</Title>
      <Text>Dette er en oversikt over hvilke komiteer som arrangerer dette arrangementet.</Text>
      <FormComponent />
      <GenericTable table={table} />
    </Box>
  )
}
