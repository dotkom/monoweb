import { Box, Text, Title } from "@mantine/core"
import type { FC } from "react"
import { EventTable } from "@/app/(internal)/arrangementer/components/events-table"
import { useCompanyEventsAllQuery } from "../queries"
import { useCompanyDetailsContext } from "./provider"

export const CompanyEventPage: FC = () => {
  const { company } = useCompanyDetailsContext()
  const { events } = useCompanyEventsAllQuery(company.id)

  return (
    <Box>
      <Title order={3}>Arrangementer</Title>
      <Text>Dette er en oversikt over hvilke arrangementer som er tilknyttet denne bedriften.</Text>
      <EventTable events={events} />
    </Box>
  )
}
