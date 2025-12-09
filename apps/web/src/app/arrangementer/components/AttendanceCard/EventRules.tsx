import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
  cn,
  Text,
} from "@dotkomonline/ui"
import { IconBook2 } from "@tabler/icons-react"
import { useState } from "react"
import { PenaltyRules } from "@/utils/penalty-rules"

interface EventRulesProps {
  className?: string
}

export const EventRules = ({ className }: EventRulesProps) => {
  const [open, setOpen] = useState(false)
  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger>
        <div className={cn("text-sm flex flex-row gap-1 items-center cursor-pointer", className)}>
          <IconBook2 className="size-[1.25em]" />
          <Text>Arrangementregler</Text>
        </div>
      </AlertDialogTrigger>
      <AlertDialogContent
        className="relative flex flex-col overflow-hidden max-h-[90vh]"
        onOutsideClick={() => setOpen(false)}
      >
        <AlertDialogTitle className="text-2xl font-bold mb-1">Arrangementregler</AlertDialogTitle>
        <AlertDialogDescription>
          Ved påmelding av dette arrangementet godtar du å følge Onlines arrangementregler beskrevet under.
        </AlertDialogDescription>
        <section className="overflow-hidden">
          <Accordion type="single" collapsible>
            <AccordionItem value="eventRules">
              <AccordionTrigger>Prikkeregler</AccordionTrigger>
              <AccordionContent className="grow overflow-y-auto p-4 max-h-[300px]">
                <PenaltyRules />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>
        <AlertDialogCancel variant={"solid"} color="brand" className="w-fit mx-auto">
          Jeg er inneforstått med reglene
        </AlertDialogCancel>
      </AlertDialogContent>
    </AlertDialog>
  )
}
