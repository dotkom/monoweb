import { GenericTable } from "@/components/GenericTable"
import { useFormBuilder } from "@/components/forms/Form"
import { createSelectInput } from "@/components/forms/SelectInput"
import { type Company, CompanySchema, EventSchema } from "@dotkomonline/types"
import { Icon } from "@iconify/react"
import { Box, Button, Group, Image, Text, Title } from "@mantine/core"
import { createColumnHelper, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import { type FC, useMemo } from "react"
import { z } from "zod"
import { useCompanyAllQuery } from "../../company/queries"
import { useAddCompanyToEventMutation, useRemoveCompanyFromEventMutation } from "../mutations"
import { useEventCompanyGetQuery } from "../queries"
import { useEventDetailsContext } from "./provider"

export const EventCompaniesPage: FC = () => {
  const { event } = useEventDetailsContext()
  const { eventCompanies } = useEventCompanyGetQuery(event.id)
  const { companies } = useCompanyAllQuery()
  const add = useAddCompanyToEventMutation()
  const remove = useRemoveCompanyFromEventMutation()

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
              <Icon width={40} height={40} icon="tabler:user-circle" />
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
            leftSection={<Icon icon="tabler:trash" />}
            onClick={() => remove.mutate({ id: event.id, company: info.getValue().id })}
          >
            Fjern
          </Button>
        ),
      }),
    ],
    [companies, columnHelper, remove, event.id]
  )
  const table = useReactTable<Company>({
    data: eventCompanies,
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
          .filter((company) => !eventCompanies.map((x) => x.id).includes(company.id))
          .map((company) => ({ label: company.name, value: company.id })),
      }),
    },
    label: "Legg til ny bedrift",
    onSubmit: (data) => {
      add.mutate(data)
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
