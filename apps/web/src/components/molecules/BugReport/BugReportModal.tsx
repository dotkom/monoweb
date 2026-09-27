import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  Title,
} from "@dotkomonline/ui"
import { IconX } from "@tabler/icons-react"
import { BugReportForm, type BugReportProps } from "./BugReportWriteForm"

export const BugReportModal = ({ open, setOpen }: BugReportProps) => {
  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent size="lg" className="p-0!" onOutsideClick={() => setOpen(false)}>
        <div className="flex items-center justify-between px-4 pt-4 rounded-t-lg">
          <AlertDialogTitle asChild>
            <Title element="h1" size="lg">
              Rapporter en feil
            </Title>
          </AlertDialogTitle>
          <AlertDialogCancel>
            <IconX className="size-[1.25em]" />
          </AlertDialogCancel>
        </div>
        <div className="flex flex-col gap-1 px-4 pb-4 rounded-lg min-h-[25dvh] max-h-[75dvh] overflow-y-auto">
          <AlertDialogDescription className="text-wrap">
            Har du oppdaget noe feil på nettsiden vår? Skriv en forklaring på hva som skjedde og hva du forventet.
          </AlertDialogDescription>

          <BugReportForm setOpen={setOpen} open={open} />
        </div>
      </AlertDialogContent>
    </AlertDialog>
  )
}