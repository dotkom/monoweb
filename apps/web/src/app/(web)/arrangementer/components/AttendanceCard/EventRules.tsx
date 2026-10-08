import { PenaltyRules } from "@/components/PenaltyRules/PenaltyRules"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogTrigger,
  Button,
  Text,
  Title,
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
      <AlertDialogTrigger
        render={
          <Button variant="ghost" className={className}>
            <IconBook2 className="size-4" />
            Arrangementregler
          </Button>
        }
      />
      <AlertDialogContent size="lg" onOutsideClick={() => setOpen(false)}>
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

          <PenaltyRules variant="compact" />
        </div>
      </AlertDialogContent>
    </AlertDialog>
  )
}
