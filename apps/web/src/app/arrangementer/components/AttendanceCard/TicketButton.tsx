"use client"

import type { Attendee } from "@dotkomonline/types"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogTrigger,
  Button,
  Text,
  Title,
} from "@dotkomonline/ui"
import { IconTicket, IconX } from "@tabler/icons-react"
import { QRCodeSVG } from "qrcode.react"
import { useState } from "react"

interface TicketButtonProps {
  attendee: Attendee
}

export const TicketButton = ({ attendee }: TicketButtonProps) => {
  const [open, setOpen] = useState(false)

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          onClick={() => setOpen(true)}
          className="w-full rounded-lg h-fit min-h-16 font-medium"
          color="light"
          icon={<IconTicket className="size-[1.25em]" />}
        >
          Vis billett
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent
        className="flex flex-col gap-4 items-center w-full p-3 sm:p-6 bg-gray-100 dark:bg-stone-700 sm:max-w-2xl rounded-2xl"
        onOutsideClick={() => setOpen(false)}
      >
        <div className="flex flex-row w-full items-center justify-between">
          <AlertDialogTitle asChild>
            <Title element="h1" size="lg">
              Din billett
            </Title>
          </AlertDialogTitle>
          <AlertDialogCancel className="p-2">
            <IconX className="size-[1.25em]" />
          </AlertDialogCancel>
        </div>

        <div className="flex flex-col gap-2 w-full items-center">
          <div className="p-4 aspect-square w-full max-w-[400px] h-full max-h-[400px] sm:max-w-[325px] sm:max-h-[325px] bg-white rounded-xl drop-shadow-lg">
            <QRCodeSVG
              size={300}
              value={attendee.id}
              level="Q"
              title="QR-kode for registrering"
              style={{ width: "100%", height: "auto" }}
            />
          </div>

          <div className="flex flex-col">
            <Text className="text-xs text-gray-500 dark:text-stone-400">ID: {attendee.id}</Text>
            <Text className="text-xs text-gray-500 dark:text-stone-400">Navn: {attendee.user.name}</Text>
          </div>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  )
}
