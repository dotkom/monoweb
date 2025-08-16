import { useUpdateEventMutation } from "@/app/event/mutations"
import { GenericTable } from "@/components/GenericTable"
import { useFormBuilder } from "@/components/forms/Form"
import { createSelectInput } from "@/components/forms/SelectInput"
import { type Company, CompanySchema, EventSchema } from "@dotkomonline/types"
import { Box, Button, Group, Image, Text, Title } from "@mantine/core"
import { IconTrash, IconUserCircle } from "@tabler/icons-react"
import { createColumnHelper, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import { type FC, useMemo } from "react"
import { z } from "zod"
import { useCompanyAllQuery } from "../../company/queries"
import { useEventContext } from "./provider"

export const EventCompaniesPage: FC = () => {
  const { event, attendance } = useEventContext()
  const updateEventMutation = useUpdateEventMutation()
  const { companies } = useCompanyAllQuery()

  const columnHelper = createColumnHelper<Company>()
  const columns = useMemo(
    () => [
      columnHelper.accessor((eventCompany) => eventCompany, {
        id: "eventCompany",
        header: () => "Navn",
        cell: (info) => {
          const name = companies.find((x) => x.id === info.getValue().id)?.name ?? "Ingen navn"
          const image = info.getValue().imageUrl
          return image !== null ? (
            <Group>
              <Image width={40} height={40} fit="contain" src={image} alt="company logo" />
              {name}
            </Group>
          ) : (
            <Group>
              <IconUserCircle width={40} height={40} />
              {name}
            </Group>
          )
        },
      }),
      columnHelper.accessor((eventCompany) => eventCompany, {
        id: "actions",
        header: () => "Verktøy",
        cell: (info) => (
          <Button
            variant="outline"
            leftSection={<IconTrash height={14} width={14} />}
            onClick={() =>
              updateEventMutation.mutate({
                id: event.id,
                event,
                companies: event.companies.filter((x) => x.id !== info.getValue().id).map((x) => x.id),
                groupIds: event.hostingGroups.map((x) => x.slug),
              })
            }
          >
            Fjern
          </Button>
        ),
      }),
    ],
    [companies, columnHelper, updateEventMutation, event.id, event.companies, event.hostingGroups, event]
  )
  const table = useReactTable<Company>({
    data: event.companies,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })
  const FormComponent = useFormBuilder({
    schema: z.object({
      id: EventSchema.shape.id,
      company: CompanySchema.shape.id,
    }),
    defaultValues: {
      id: event.id,
    },
    fields: {
      company: createSelectInput({
        label: "Bedriftsnavn",
        searchable: true,
        data: companies
          .filter((company) => !event.companies.map((x) => x.id).includes(company.id))
          .map((company) => ({ label: company.name, value: company.id })),
      }),
    },
    label: "Legg til ny bedrift",
    onSubmit: (data) => {
      updateEventMutation.mutate({
        id: event.id,
        event,
        companies: event.companies.map((x) => x.id).concat([data.company]),
        groupIds: event.hostingGroups.map((x) => x.slug),
      })
    },
  })

  return (
    <Box>
      <Title order={3}>Bedrifter</Title>
      <Text>Dette er en oversikt over hvilke bedrifter som arrangerer dette arrangementet.</Text>
      <FormComponent />
      <GenericTable table={table} />
    </Box>
  )
}
