import { FC, useMemo } from "react"
import { useEventDetailsContext } from "./provider"
import { createColumnHelper, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import { Company, CompanySchema, EventSchema } from "@dotkomonline/types"
import { GenericTable } from "../../../../components/GenericTable"
import { Box, Button, Text, Title } from "@mantine/core"
import { Icon } from "@iconify/react"
import { createSelectInput, useFormBuilder } from "../../../form"
import { z } from "zod"
import { useAddCompanyToEventMutation } from "../../../../modules/event/mutations/use-add-company-to-event-mutation"
import { useRemoveCompanyFromEventMutation } from "../../../../modules/event/mutations/use-remove-company-from-event-mutation"
import { useCompanyAllQuery } from "../../../../modules/company/queries/use-company-all-query"
import { useEventCompanyGetQuery } from "../../../../modules/event/queries/use-event-company-get-query"
import { CompanyName } from "../../../../components/molecules/company-name/company-name"

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
        header: () => "Bedrift",
        cell: (info) => <CompanyName company={info.getValue()} />,
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
    [columnHelper, remove, event.id]
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
