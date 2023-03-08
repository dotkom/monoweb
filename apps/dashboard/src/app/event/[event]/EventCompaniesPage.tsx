import { FC } from "react"
import { useEventDetailsContext } from "./provider"
import { trpc } from "../../../trpc"
import { createColumnHelper, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import { Company, CompanySchema, EventSchema } from "@dotkomonline/types"
import { GenericTable } from "../../../components/GenericTable"
import { Box, Button, Group, Image, Text, Title } from "@mantine/core"
import { Icon } from "@iconify/react"
import { createSelectInput, useFormBuilder } from "../../form"
import { z } from "zod"

export const EventCompaniesPage: FC = () => {
  const { event } = useEventDetailsContext()
  const { data: eventCompanies = [] } = trpc.event.getCompanies.useQuery({
    id: event.id,
  })
  const { data: companies = [] } = trpc.company.all.useQuery({ take: 999 })
  const utils = trpc.useContext()
  const { mutate: deleteCompanyMutate } = trpc.event.deleteCompany.useMutation({
    onSuccess: () => {
      utils.event.getCompanies.invalidate()
    },
  })
  const { mutate: addCompanyMutate } = trpc.event.addCompany.useMutation({
    onSuccess: () => {
      utils.event.getCompanies.invalidate()
    },
  })
  const columnHelper = createColumnHelper<Company>()
  const columns = [
    columnHelper.accessor((eventCompany) => eventCompany, {
      id: "eventCompany",
      header: () => "Navn",
      cell: (info) => {
        const name = companies.find((x) => x.id === info.getValue().id)?.name ?? "Ingen navn"
        const image = info.getValue().image
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
      cell: (info) => {
        const id = info.getValue().id
        const onClick = () => deleteCompanyMutate({ id: event.id, company: id })
        return (
          <Button variant="outline" leftIcon={<Icon icon="tabler:trash" />} onClick={onClick}>
            Fjern
          </Button>
        )
      },
    }),
  ]
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
    onSubmit: (data) => addCompanyMutate(data),
  })

  return (
    <Box>
      <Title order={3}>Bedrifter</Title>
      <Text>Dette er en oversikt over hvilke bedrifter som arrangerer dette arrangementet.</Text>
      {FormComponent}
      <GenericTable table={table} />
    </Box>
  )
}
