import { PenaltyRules } from "@/utils/penalty-rules"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogTrigger,
  Title,
} from "@dotkomonline/ui"
import { IconInfoCircle } from "@tabler/icons-react"
import { useState } from "react"

export const PenaltyDialog = () => {
  const [open, setOpen] = useState(false)
  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger className="w-fit flex items-center gap-1 underline">
        <IconInfoCircle className="size-5" /> Hva er en prikk?
      </AlertDialogTrigger>
      <AlertDialogContent className="max-h-[80vh]" onOutsideClick={() => setOpen(false)}>
        <AlertDialogTitle asChild>
          <Title>Online's Prikkeregler</Title>
        </AlertDialogTitle>
        <section className="overflow-y-auto max-h-[60vh] p-2">
          <PenaltyRules />
        </section>
        <AlertDialogCancel variant={"solid"} color="brand" className="w-fit mx-auto">
          Jeg er inneforstått med reglene
        </AlertDialogCancel>
      </AlertDialogContent>
    </AlertDialog>
  )
}
