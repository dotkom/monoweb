"use client"

import { TextareaField } from "@/components/forms/TextareaField"
import { Form } from "@/components/forms/new-form/Form"
import type { Attendee } from "@dotkomonline/rpc/attendance"
import type { EventId } from "@dotkomonline/rpc/event"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogTitle,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@dotkomonline/ui"
import { zodResolver } from "@hookform/resolvers/zod"
import { IconX } from "@tabler/icons-react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useNotifyAttendeesMutation } from "../../../mutations"

const FormSchema = z.object({
  message: z.string().min(1),
})

type FormValues = z.infer<typeof FormSchema>

type NotifyAttendeesModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  eventId: EventId
  attendees: Attendee[]
}

export function NotifyAttendeesModal({ open, onOpenChange, eventId, attendees }: NotifyAttendeesModalProps) {
  const { mutate: notifyAttendees, isPending } = useNotifyAttendeesMutation()
  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    mode: "onChange",
  })

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent size="lg" onOutsideClick={() => onOpenChange(false)}>
        <div className="flex flex-row items-center justify-between gap-4">
          <AlertDialogTitle>Send e-post til påmeldte</AlertDialogTitle>
          <AlertDialogCancel type="button">
            <IconX className="size-5" />
          </AlertDialogCancel>
        </div>

        {open && (
          <Form
            form={form}
            onSubmit={(values) => {
              notifyAttendees({ eventId, message: values.message }, { onSuccess: () => onOpenChange(false) })
            }}
            className="flex flex-col gap-4"
          >
            <div className="max-h-[200px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Navn</TableHead>
                    <TableHead>E-post</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attendees.map((attendee) => (
                    <TableRow key={attendee.id}>
                      <TableCell>{attendee.user.name}</TableCell>
                      <TableCell>{attendee.user.email}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <TextareaField
              control={form.control}
              name="message"
              label="Melding"
              placeholder="Skriv meldingen her..."
              rows={5}
            />

            <Button type="submit" variant="default" className="w-fit" disabled={!form.formState.isValid || isPending}>
              Send e-post
            </Button>
          </Form>
        )}
      </AlertDialogContent>
    </AlertDialog>
  )
}
