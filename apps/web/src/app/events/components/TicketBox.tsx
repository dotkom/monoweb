import { Attendee } from "@dotkomonline/types";
import { Icon } from "@dotkomonline/ui";
import { Cross1Icon, Cross2Icon, LockClosedIcon } from "@radix-ui/react-icons";
import { Close } from "@radix-ui/react-popover";
import { QRCodeSVG } from "qrcode.react";
import { useState } from "react";

interface TicketBoxProps {
  attendee: Attendee;
}

const TicketBox = ({ attendee }: TicketBoxProps) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="">
      {!open && <button onClick={() => setOpen(true)}>Vis billett</button>}
      {open && (
        <div className="fixed top-0 left-0 w-screen h-screen bg-slate-1 z-50 overflow-hidden">
          <div className="flex justify-start p-10">
            <button onClick={() => setOpen(false)}>
                <Cross2Icon width={20} height={20} /> 
            
            </button>
          </div>
          <div className="flex flex-col items-center pt-20">
            <h1 className="text-2xl font-bold">Ditt billett</h1>
            <p className="text-lg">Dette er din billett til arrangementet</p>
          </div>
          <div className="flex flex-col items-center pt-10">
            {attendee && (
              <QRCodeSVG
                value={attendee.id}
                imageSettings={{
                  src: "https://old.online.ntnu.no/wiki/70/plugin/attachments/download/680/",
                  x: undefined,
                  y: undefined,
                  height: 24,
                  width: 24,
                  excavate: true,
                }}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketBox;
