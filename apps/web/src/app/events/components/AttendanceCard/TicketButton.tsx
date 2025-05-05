"use client"

import type { UserId } from "@dotkomonline/types"
import { Button, Icon, Text, Title } from "@dotkomonline/ui"
import { Cross2Icon } from "@radix-ui/react-icons"
import { QRCodeSVG } from "qrcode.react"
import { useState } from "react"

interface TicketButtonProps {
  userId: UserId | null
}

export const TicketButton = ({ userId }: TicketButtonProps) => {
  const [open, setOpen] = useState(false)

  const className =
    "flex flex-row gap-2 items-center w-full bg-green-5 hover:bg-green-6 text-black rounded-lg h-fit min-h-[4rem] p-2 text-left opacity-100 disabled:opacity-100"

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)} className={className}>
        <Icon icon="tabler:ticket" className="text-lg" />
        <Text className="font-medium">Vis billett</Text>
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
          {userId && (
            <QRCodeSVG
              value={userId}
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
