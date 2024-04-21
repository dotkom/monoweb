import type { UserId } from "@dotkomonline/types"
import { Button } from "@dotkomonline/ui"
import { Cross2Icon } from "@radix-ui/react-icons"
import { QRCodeSVG } from "qrcode.react"
import { useState } from "react"

interface TicketButtonProps {
  userid: UserId | null
}

const TicketButton = ({ userid }: TicketButtonProps) => {
  const [open, setOpen] = useState(false)
  return (
    <div className="">
      {!open && (
        <div className="w-full flex justify-center">
          <Button onClick={() => setOpen(true)}>Vis billett</Button>
        </div>
      )}
      {open && (
        <div className="fixed top-0 left-0 w-screen h-screen bg-slate-1 z-50 overflow-hidden">
          <div className="flex justify-start p-10">
            <Button onClick={() => setOpen(false)}>
              <Cross2Icon width={20} height={20} />
            </Button>
          </div>
          <div className="flex flex-col items-center pt-20">
            <h1 className="text-2xl font-bold">Din billett</h1>
            <p className="text-lg">Dette er din billett til arrangementet</p>
          </div>
          <div className="flex flex-col items-center pt-10">
            {userid && (
              <QRCodeSVG
                value={userid}
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
      )}
    </div>
  )
}

export default TicketButton
