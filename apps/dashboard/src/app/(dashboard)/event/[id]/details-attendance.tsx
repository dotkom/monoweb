import React, { FC, useMemo, useState } from "react"
import { useEventDetailsContext } from "./provider"
import { Box, Title, Checkbox, Button } from "@mantine/core"
import { useEventAttendanceGetQuery } from "src/modules/event/queries/use-event-attendance-get-query"
import { useUpdateEventAttendanceMutation } from "src/modules/event/mutations/use-update-event-attendance-mutation"
import { createColumnHelper, useReactTable, getCoreRowModel } from "@tanstack/react-table"
import { GenericTable } from "src/components/GenericTable"
import { Attendee } from "@dotkomonline/types"
import { QrReader } from "react-qr-reader"

interface CustomCheckboxProps {
  userId: string
  attendanceId: string
  defaultChecked?: boolean
}
const CustomCheckbox = React.memo(({ attendanceId, userId, defaultChecked }: CustomCheckboxProps) => {
  const updateAttendance = useUpdateEventAttendanceMutation()

  const toggleAttendance = (userId: string, attendanceId: string, currentCheckedState: boolean) => {
    updateAttendance.mutate({ userId, attendanceId, attended: currentCheckedState })
  }
  return (
    <Checkbox
      onChange={(event) => {
        toggleAttendance(userId, attendanceId, event.currentTarget.checked)
      }}
      defaultChecked={defaultChecked}
    />
  )
})

CustomCheckbox.displayName = "attendanceToggle"

const ViewFinder = ({ data, updateAttendance, setData }: { data: string; updateAttendance: any; setData: any }) => {
  if (data === "") {
    return null
  }
  return (
    <div
      style={{
        top: 0,
        left: 0,
        zIndex: 1,
        boxSizing: "border-box",
        background: "rgba(0, 0, 0, 0.5)",
        position: "absolute",
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Button
        onClick={() => {
          const userId = data.split("/")[0]
          const attendanceId = data.split("/")[1]
          updateAttendance.mutate({ userId, attendanceId, attended: true })
          //TODO: Fix this hack
          setTimeout(() => {
            setData("")
          }, 100)
        }}
      >
        Møtt
      </Button>
    </div>
  )
}

export const EventAttendancePage: FC = () => {
  const { event } = useEventDetailsContext()
  const { eventAttendance } = useEventAttendanceGetQuery(event.id)

  const columnHelper = createColumnHelper<Attendee>()
  const columns = useMemo(
    () => [
      columnHelper.accessor("userId", {
        header: () => "Bruker",
      }),
      columnHelper.accessor((attendee) => attendee, {
        id: "attended",
        header: () => "Møtt",
        cell: (info) => (
          <CustomCheckbox
            userId={info.getValue().userId}
            attendanceId={info.getValue().attendanceId}
            defaultChecked={info.getValue().attended}
          />
        ),
      }),
    ],
    [columnHelper]
  )

  const table = useReactTable({
    data: eventAttendance?.flatMap((attendance) => attendance.attendees) ?? [],
    getCoreRowModel: getCoreRowModel(),
    columns,
  })

  const [data, setData] = useState("")
  const updateAttendance = useUpdateEventAttendanceMutation()
  const [showScanner, setShowScanner] = useState(false)

  return (
    <Box>
      <Title order={3}>Påmeldte</Title>
      <Button
        onClick={() => {
          setTimeout(() => {
            setShowScanner(!showScanner)
          }, 100)
        }}
      >
        {showScanner ? "Skru av" : "Skru på"} QR-leser
      </Button>
      {showScanner && (
        <div style={{ position: "relative", width: "50%" }}>
          <QrReader
            onResult={(result, _, _codeReader) => {
              if (result) {
                setData(result.getText())
                // updateAttendance.mutate({ userId: result, attendanceId: "1", attended: true })
              }
            }}
            containerStyle={{ position: "relative", width: "100%", height: "100%" }}
            constraints={{ facingMode: "none" }}
          />
          <ViewFinder data={data} updateAttendance={updateAttendance} setData={setData} />
        </div>
      )}
      {eventAttendance?.map((attendance) => (
        <Box key={attendance.id} mb="sm">
          <Title order={4}>
            {attendance.id} {"(" + attendance.attendees.length + "/" + attendance.limit + ")"}
          </Title>
          <GenericTable table={table} />
        </Box>
      ))}
    </Box>
  )
}
