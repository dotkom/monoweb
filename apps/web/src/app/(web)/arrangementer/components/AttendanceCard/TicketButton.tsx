"use client"

import type { Attendee } from "@dotkomonline/rpc/attendance"
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Button,
  Text,
  Title,
} from "@dotkomonline/ui"
import { IconTicket, IconX } from "@tabler/icons-react"
import { QRCodeSVG } from "qrcode.react"

interface TicketButtonProps {
  attendee: Attendee
}

export const TicketButton = ({ attendee }: TicketButtonProps) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="w-full rounded-lg h-fit min-h-16 text-base font-medium bg-gray-200 hover:bg-gray-100 dark:bg-stone-700 dark:hover:bg-stone-600">
          <div className="mx-auto grid w-fit max-w-full min-w-0 grid-cols-[--spacing(4.5)_minmax(0,1fr)_--spacing(4.5)] items-center gap-2 sm:flex">
            <span aria-hidden className="flex h-lh items-center justify-center">
              <IconTicket className="size-4.5" />
            </span>
            <Text element="span" className="min-w-0 text-center font-medium">
              Vis billett
            </Text>
          </div>
        </Button>
      </DialogTrigger>
      <DialogContent size="lg" className="p-3 sm:p-6 bg-gray-100 dark:bg-stone-700">
        <DialogHeader className="flex-row items-center justify-between">
          <DialogTitle asChild>
            <Title element="h1" size="lg">
              Din billett
            </Title>
          </DialogTitle>
          <DialogClose className="p-2">
            <IconX className="size-[1.25em]" />
          </DialogClose>
        </DialogHeader>

        <DialogBody>
          <div className="flex flex-col gap-2 items-center">
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
        </DialogBody>
      </DialogContent>
    </Dialog>
  )
}
