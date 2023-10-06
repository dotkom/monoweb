import { type Company, CompanySchema, EventSchema } from "@dotkomonline/types";
import { Icon } from "@iconify/react";
import { Box, Button, Group, Image, Text, Title } from "@mantine/core";
import { createColumnHelper, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { type FC, useMemo } from "react";
import { z } from "zod";

import { GenericTable } from "../../../../components/GenericTable";
import { useCompanyAllQuery } from "../../../../modules/company/queries/use-company-all-query";
import { useAddCompanyToEventMutation } from "../../../../modules/event/mutations/use-add-company-to-event-mutation";
import { useRemoveCompanyFromEventMutation } from "../../../../modules/event/mutations/use-remove-company-from-event-mutation";
import { useEventCompanyGetQuery } from "../../../../modules/event/queries/use-event-company-get-query";
import { createSelectInput, useFormBuilder } from "../../../form";
import { useEventDetailsContext } from "./provider";

export const EventCompaniesPage: FC = () => {
  const { event } = useEventDetailsContext();
  const { eventCompanies } = useEventCompanyGetQuery(event.id);
  const { companies } = useCompanyAllQuery();
  const add = useAddCompanyToEventMutation();
  const remove = useRemoveCompanyFromEventMutation();

  const columnHelper = createColumnHelper<Company>();
  const columns = useMemo(
    () => [
      columnHelper.accessor((eventCompany) => eventCompany, {
        cell: (info) => {
          const name = companies.find((x) => x.id === info.getValue().id)?.name ?? "Ingen navn";
          const image = info.getValue().image;

          return image !== null ? (
            <Group>
              <Image alt="company logo" fit="contain" height={40} src={image} width={40} />
              {name}
            </Group>
          ) : (
            <Group>
              <Icon height={40} icon="tabler:user-circle" width={40} />
              {name}
            </Group>
          );
        },
        header: () => "Navn",
        id: "eventCompany",
      }),
      columnHelper.accessor((eventCompany) => eventCompany, {
        cell: (info) => (
          <Button
            leftSection={<Icon icon="tabler:trash" />}
            onClick={() => remove.mutate({ company: info.getValue().id, id: event.id })}
            variant="outline"
          >
            Fjern
          </Button>
        ),
        header: () => "Verktøy",
        id: "actions",
      }),
    ],
    [companies, columnHelper, remove, event.id]
  );

  const table = useReactTable<Company>({
    columns,
    data: eventCompanies,
    getCoreRowModel: getCoreRowModel(),
  });

  const FormComponent = useFormBuilder({
    defaultValues: {
      id: event.id,
    },
    fields: {
      company: createSelectInput({
        data: companies
          .filter((company) => !eventCompanies.map((x) => x.id).includes(company.id))
          .map((company) => ({ label: company.name, value: company.id })),
        label: "Bedriftsnavn",
      }),
    },
    label: "Legg til ny bedrift",
    onSubmit: (data) => {
      add.mutate(data);
    },
    schema: z.object({
      company: CompanySchema.shape.id,
      id: EventSchema.shape.id,
    }),
  });

  return (
    <Box>
      <Title order={3}>Bedrifter</Title>
      <Text>Dette er en oversikt over hvilke bedrifter som arrangerer dette arrangementet.</Text>
      <FormComponent />
      <GenericTable table={table} />
    </Box>
  );
};
