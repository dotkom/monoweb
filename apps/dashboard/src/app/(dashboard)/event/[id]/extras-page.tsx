import { Icon } from "@iconify/react"
import { ActionIcon, Box, Button, Paper, Title } from "@mantine/core"
import { type FC } from "react"
import { useEventDetailsContext } from "./provider"
import { useCreateAttendanceExtrasModal } from "../../../../modules/event/modals/create-event-extras-modal"
import { useEditExtrasModal } from "../../../../modules/event/modals/edit-event-extras-modal"
import {
  useAddAttendanceMutation,
  useUpdateExtrasMutation,
} from "../../../../modules/attendance/mutations/use-attendance-mutations"
import { Attendance } from "@dotkomonline/types"
import useAttendanceForm from "../../../../modules/attendance/components/attendance-page/AttendanceForm"

export const ExtrasPage: FC = () => {
  const { attendance } = useEventDetailsContext()
  const { event } = useEventDetailsContext()

  if (!attendance) {
    return <NoAttendanceFallback eventId={event.id} />
  }

  return <_ExtrasPage attendance={attendance} />
}

const NoAttendanceFallback: FC<{ eventId: string }> = ({ eventId }) => {
  const mutation = useAddAttendanceMutation()
  const AttendanceForm = useAttendanceForm({
    defaultValues: {
      registerStart: new Date(),
      registerEnd: new Date(),
      deregisterDeadline: new Date(),
      extras: null,
    },
    label: "Opprett",
    onSubmit: (values) => {
      mutation.mutate({ eventId, obj: values })
    },
  })

  return (
    <Box>
      <Title order={5}>Ingen påmelding</Title>
      <AttendanceForm />
    </Box>
  )
}
interface Props {
  attendance: Attendance
}
export const _ExtrasPage: FC<Props> = ({ attendance }) => {
  const openCreate = useCreateAttendanceExtrasModal({
    attendance,
  })

  const openEdit = useEditExtrasModal({
    attendance,
  })

  const edit = useUpdateExtrasMutation()

  const deleteAlternative = (id: string) => {
    const newChoices = attendance.extras?.filter((alt) => alt.id !== id)
    edit.mutate({
      id: attendance.id,
      extras: newChoices ?? [],
    })
  }

  return (
    <Box>
      <Title order={3}>Valg</Title>
      {!attendance.extras?.length && <p>Ingen valg er lagt til</p>}
      <Box>
        {attendance.extras?.map((extra) => (
          <Paper key={extra.id} withBorder p={"md"} mt={"md"}>
            <ActionIcon variant="outline" onClick={() => openEdit(extra)} mr="md">
              <Icon icon="tabler:edit" />
            </ActionIcon>
            <ActionIcon variant="outline" onClick={() => deleteAlternative(extra.id)} color="red">
              <Icon icon="tabler:trash" />
            </ActionIcon>
            <h3>{extra.name}</h3>
            {extra.choices.map((choice) => (
              <div key={choice.id}>
                <p>{choice.name}</p>
              </div>
            ))}
          </Paper>
        ))}
      </Box>

      <Button mt="md" onClick={openCreate}>
        Legg til nytt valg
      </Button>
    </Box>
  )
}
