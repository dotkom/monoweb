import { CompanySchema, EventSchema, Event } from "@dotkomonline/types"
import { Box, Text, Title } from "@mantine/core"
import { FC, useMemo } from "react"
import { z } from "zod"
import { GenericTable } from "../../../../components/GenericTable"
import { trpc } from "../../../../utils/trpc"
import { createSelectInput, useFormBuilder } from "../../../form"
import { useQueryNotification } from "../../../notifications"
import { useCompanyDetailsContext } from "./provider"
import { createColumnHelper, getCoreRowModel, useReactTable } from "@tanstack/react-table"

export const CompanyEventsPage: FC = () => {
  const { company } = useCompanyDetailsContext()
  const createNotification = useQueryNotification()
  const deleteNotification = useQueryNotification()
  const { data: companyEvents = [] } = trpc.company.event.get.useQuery({
    // Adjusted trpc method
    id: company.id,
  }) as { data: Event[] }
  const { data: events = [] } = trpc.event.all.useQuery({ take: 999 }) // Get all events
  const utils = trpc.useContext()
  const { mutate: deleteEventMutate } = trpc.company.event.delete.useMutation({
    onSuccess: () => {
      deleteNotification.complete({
        title: "Arrangement fjernet",
        message: "Arrangementet har blitt fjernet fra bedriftens liste.",
      })
      utils.company.event.get.invalidate()
    },
  })
  const { mutate: createEventMutate } = trpc.company.event.create.useMutation({
    onSuccess: () => {
      createNotification.complete({
        title: "Arrangement lagt til",
        message: "Arrangementet har blitt lagt til bedriftens liste.",
      })
      utils.company.event.get.invalidate()
    },
  })

  const columnHelper = createColumnHelper<Event>()
  const columns = useMemo(
    () => [
      columnHelper.accessor((eventCompany) => eventCompany, {
        id: "companyEvent",
        header: () => "Navn",
        cell: (info) => {
          return info.getValue().title
        },
      }),
      columnHelper.accessor((eventCompany) => eventCompany, {
        id: "actions",
        header: () => "Verktøy",
        cell: (info) => {
          console.log("slette")
        },
      }),
    ],
    [columnHelper, deleteNotification]
  )
  const table = useReactTable<Event>({
    data: companyEvents,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  const FormComponent = useFormBuilder({
    schema: z.object({
      id: CompanySchema.shape.id,
      event: EventSchema.shape.id,
    }),
    defaultValues: {
      id: company.id,
    },
    fields: {
      event: createSelectInput({
        label: "Arrangementnavn",
        data: events
          .filter((event) => !companyEvents.map((x) => x.id).includes(event.id))
          .map((event) => ({ label: event.title, value: event.id })),
      }),
    },
    label: "Legg til nytt arrangement",
    onSubmit: (data) => {
      createNotification.loading({
        title: "Legger til arrangement...",
        message: `Legger til arrangementet til bedriftens liste.`,
      })
      createEventMutate(data)
    },
  })

  return (
    <Box>
      <Title order={3}>Arrangementer</Title>
      <Text>Dette er en oversikt over hvilke arrangementer som er tilknyttet denne bedriften.</Text>
      <FormComponent />
      <GenericTable table={table} />
    </Box>
  )
}
