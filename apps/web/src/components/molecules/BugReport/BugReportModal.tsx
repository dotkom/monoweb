import {
  DialogBody,
  DialogHeader,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  Title,
} from "@dotkomonline/ui"
import { IconX } from "@tabler/icons-react"
import { BugReportForm, type BugReportProps } from "./BugReportWriteForm"

export const BugReportModal = ({ open, setOpen }: BugReportProps) => {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent size="lg" className="p-0!">
        <DialogHeader className="flex-row flex items-center justify-between px-4 pt-4 rounded-t-lg">
          <DialogTitle asChild>
            <Title element="h1" size="lg">
              Rapporter en feil
            </Title>
          </DialogTitle>
          <DialogClose>
            <IconX className="size-[1.25em]" />
          </DialogClose>
        </DialogHeader>
        <DialogBody>
          <div className="flex min-h-[25dvh] flex-col gap-1 rounded-lg px-4 pb-4">
            <DialogDescription className="text-wrap">
              Har du oppdaget noe feil på nettsiden vår? Skriv en forklaring på hva som skjedde og hva du forventet.
            </DialogDescription>

            <BugReportForm setOpen={setOpen} open={open} />
          </div>
        </DialogBody>
      </DialogContent>
    </Dialog>
  )
}
