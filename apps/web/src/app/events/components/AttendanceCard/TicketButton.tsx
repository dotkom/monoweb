"use client"

import type { AttendeeId } from "@dotkomonline/types"
import { Button, Icon, Text, Title } from "@dotkomonline/ui"
import { Cross2Icon } from "@radix-ui/react-icons"
import { QRCodeSVG } from "qrcode.react"
import { useState } from "react"

interface TicketButtonProps {
  attendeeId: AttendeeId | null
}

export const TicketButton = ({ attendeeId }: TicketButtonProps) => {
  const [open, setOpen] = useState(false)

  const className = "w-full rounded-lg h-fit min-h-[4rem] font-medium"

  if (!open) {
    return (
      <Button
        onClick={() => setOpen(true)}
        className={className}
        color="light"
        icon={<Icon icon="tabler:ticket" className="text-lg" />}
      >
        Vis billett
      </Button>
    )
  }

  return (
    <div className="fixed top-0 left-0 w-screen h-screen bg-slate-1 z-50 overflow-hidden">
      <div className="flex justify-start p-10">
        <Button onClick={() => setOpen(false)}>
          <Cross2Icon width={20} height={20} />
        </Button>
      </div>
      <div className="flex flex-col items-center">
        <div className="flex flex-col pt-20">
          <Title element="h1" className="text-2xl font-semibold font-poppins">
            Din billett
          </Title>
          <Text className="text-lg">Dette er din billett til arrangementet</Text>
        </div>
        <div className="pt-10">
          {attendeeId && (
            <QRCodeSVG
              value={attendeeId}
              size={256}
              imageSettings={{
                src: "https://old.online.ntnu.no/wiki/70/plugin/attachments/download/680/",
                x: undefined,
                y: undefined,
                height: 60,
                width: 60,
                excavate: true,
              }}
            />
          )}
        </div>
      </div>
    </div>
  )
}
