import { ErrorMessage } from "@hookform/error-message"
import { zodResolver } from "@hookform/resolvers/zod"
import type { Attendee, EventId } from "@dotkomonline/types"
import { Button, ScrollArea, Stack, Table, Textarea } from "@mantine/core"
import { type ContextModalProps, modals } from "@mantine/modals"
import type { FC } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useNotifyAttendeesMutation } from "../mutations"

interface ModalProps {
  eventId: EventId
  attendees: Attendee[]
}

const FormSchema = z.object({
  message: z.string().min(1),
})
type FormValues = z.infer<typeof FormSchema>

export const NotifyAttendeesModal: FC<ContextModalProps<ModalProps>> = ({
  context,
  id,
  innerProps: { eventId, attendees },
}) => {
  const { mutate: notifyAttendees, isPending } = useNotifyAttendeesMutation()
  const {
    register,
    handleSubmit,
    formState: { isValid, errors },
  } = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    mode: "onChange",
  })

  const onSubmit = handleSubmit((values) => {
    notifyAttendees({ eventId, message: values.message }, { onSuccess: () => context.closeModal(id) })
  })

  return (
    <form onSubmit={onSubmit}>
      <Stack>
        <ScrollArea h={200} type="auto">
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Navn</Table.Th>
                <Table.Th>E-post</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {attendees.map((attendee) => (
                <Table.Tr key={attendee.id}>
                  <Table.Td>{attendee.user.name}</Table.Td>
                  <Table.Td>{attendee.user.email}</Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </ScrollArea>

        <Textarea
          {...register("message")}
          label="Melding"
          placeholder="Skriv meldingen her..."
          minRows={5}
          autosize
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.stopPropagation()
            }
          }}
          error={errors.message && <ErrorMessage errors={errors} name="message" />}
        />

        <Button type="submit" loading={isPending} disabled={!isValid}>
          Send e-post
        </Button>
      </Stack>
    </form>
  )
}

export const openNotifyAttendeesModal = ({ eventId, attendees }: ModalProps) =>
  modals.openContextModal({
    modal: "event/attendance/notify-attendees",
    title: "Send e-post til påmeldte",
    innerProps: { eventId, attendees },
  })
