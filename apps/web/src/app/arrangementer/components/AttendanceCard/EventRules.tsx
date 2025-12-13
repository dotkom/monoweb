import { PenaltyRules } from "@/utils/penalty-rules"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogTrigger,
  Text,
  Title,
  cn,
} from "@dotkomonline/ui"
import { IconBook2, IconX } from "@tabler/icons-react"
import { useState } from "react"

interface EventRulesProps {
  className?: string
}

export const EventRules = ({ className }: EventRulesProps) => {
  const [open, setOpen] = useState(false)
  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger>
        <div className={cn("flex flex-row gap-2 items-center cursor-pointer", className)}>
          <IconBook2 className="size-[1.25em]" />
          <Text className="text-sm">Arrangementregler</Text>
        </div>
      </AlertDialogTrigger>
      <AlertDialogContent onOutsideClick={() => setOpen(false)}>
        <div className="flex flex-row gap-4 justify-between">
          <AlertDialogTitle asChild>
            <Title element="h1" size="lg">
              Arrangementregler
            </Title>
          </AlertDialogTitle>

          <AlertDialogCancel>
            <IconX className="size-[1.25em]" />
          </AlertDialogCancel>
        </div>

        <div className="flex flex-col gap-8 rounded-lg min-h-[25dvh] max-h-[75dvh] overflow-y-auto pr-4 -mr-4">
          <Text>Ved påmelding av dette arrangementet godtar du å følge Onlines arrangementregler beskrevet under.</Text>

          <PenaltyRules small />
        </div>
      </AlertDialogContent>
    </AlertDialog>
  )
}
