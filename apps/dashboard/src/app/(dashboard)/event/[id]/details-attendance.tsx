import { FC, useMemo } from "react"
import { useEventDetailsContext } from "./provider"
import { createColumnHelper, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import { Company, CompanySchema, EventSchema } from "@dotkomonline/types"
import { GenericTable } from "../../../../components/GenericTable"
import { Box, Button, Group, Image, Text, Title } from "@mantine/core"
import { Icon } from "@iconify/react"
import { createSelectInput, useFormBuilder } from "../../../form"
import { z } from "zod"
import { useAddCompanyToEventMutation } from "../../../../modules/event/mutations/use-add-company-to-event-mutation"
import { useRemoveCompanyFromEventMutation } from "../../../../modules/event/mutations/use-remove-company-from-event-mutation"
import { useCompanyAllQuery } from "../../../../modules/company/queries/use-company-all-query"
import { useEventAttendanceGetQuery } from "src/modules/event/queries/use-event-attendance-get-query"

export const EventDetailsAttendance: FC = () => {
  const { event } = useEventDetailsContext()
  const { eventAttendance } = useEventAttendanceGetQuery(event.id)

  return (
    <Box>
      <Title order={3}>Påmeldte</Title>
      {eventAttendance?.map((attendance) => (
        <Box key={attendance.id} display="flex" mb="sm">
          <Text>
            {attendance.id} {"(" + attendance.attendees.length + "/" + attendance.limit + ")"}
          </Text>
          {attendance.attendees.map((attendee) => (
            <Box key={attendee.id} mr="sm">
              <Text>{attendee.userId}</Text>
              <Text>{attendee.attended}</Text>
            </Box>
          ))}
        </Box>
      ))}
    </Box>
  )
}
