"use client"

import type { Attendee } from "@dotkomonline/types"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogTrigger,
  Button,
  Icon,
  Text,
  Title,
} from "@dotkomonline/ui"
import { QRCodeSVG } from "qrcode.react"
import { useState } from "react"

interface TicketButtonProps {
  attendee: Attendee
}

export const TicketButton = ({ attendee }: TicketButtonProps) => {
  const [open, setOpen] = useState(false)

  const imageSettings = attendee.user.imageUrl
    ? {
        src: attendee.user.imageUrl,
        excavate: true,
        height: 58,
        width: 58,
      }
    : undefined

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          onClick={() => setOpen(true)}
          className="w-full rounded-lg h-fit min-h-[4rem] font-medium"
          color="light"
          icon={<Icon icon="tabler:ticket" className="text-lg" />}
        >
          Vis billett
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent
        className="flex flex-col gap-4 items-center w-full p-6 bg-gray-100 dark:bg-stone-800 max-w-2xl rounded-lg"
        onOutsideClick={() => setOpen(false)}
      >
        <div className="flex flex-row w-full items-center justify-between">
          <AlertDialogTitle asChild>
            <Title element="h1" size="lg">
              Din billett
            </Title>
          </AlertDialogTitle>
          <AlertDialogCancel className="p-2">
            <Icon className="text-xl" icon="tabler:x" />
          </AlertDialogCancel>
        </div>

        <div className="flex flex-col gap-2">
          <div className="p-4 bg-white rounded-lg w-fit drop-shadow-lg">
            <QRCodeSVG value={attendee.id} size={240} imageSettings={imageSettings} />
          </div>

          <div className="flex flex-col">
            <Text className="text-xs text-gray-500 dark:text-stone-500">ID: {attendee.id}</Text>
            <Text className="text-xs text-gray-500 dark:text-stone-500">Navn: {attendee.user.name}</Text>
          </div>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  )
}
