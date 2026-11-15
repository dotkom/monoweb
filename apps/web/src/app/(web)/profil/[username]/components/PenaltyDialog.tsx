import { PenaltyRules } from "@/components/PenaltyRules/PenaltyRules"
import { DialogBody, Dialog, DialogClose, DialogContent, DialogTitle, DialogTrigger, Title } from "@dotkomonline/ui"
import { IconInfoCircle } from "@tabler/icons-react"
import { useState } from "react"

export const PenaltyDialog = () => {
  const [open, setOpen] = useState(false)
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="w-fit flex items-center gap-1 underline">
        <IconInfoCircle className="size-5" /> Hva er en prikk?
      </DialogTrigger>
      <DialogContent className="max-h-[80vh]">
        <DialogTitle asChild>
          <Title>Online's Prikkeregler</Title>
        </DialogTitle>
        <DialogBody>
          <div className="flex flex-col gap-4">
            <section className="overflow-y-auto max-h-[60vh] p-2">
              <PenaltyRules />
            </section>
            <DialogClose variant="default" color="gray" className="w-fit mx-auto">
              Jeg er inneforstått med reglene
            </DialogClose>
          </div>
        </DialogBody>
      </DialogContent>
    </Dialog>
  )
}
