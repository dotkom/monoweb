import { PenaltyRules } from "@/components/PenaltyRules/PenaltyRules"
import {
  Button,
  type ButtonProps,
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogTrigger,
  Text,
  Title,
} from "@dotkomonline/ui"
import { IconBook2, IconX } from "@tabler/icons-react"
import type { ReactElement } from "react"

interface EventRulesDialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  trigger?: ReactElement
}

export const EventRulesDialog = ({ open, onOpenChange, trigger }: EventRulesDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger render={trigger} />}

      <DialogContent size="lg">
        <div className="flex flex-row gap-4 justify-between">
          <DialogTitle asChild>
            <Title element="h1" size="lg">
              Prikkeregler
            </Title>
          </DialogTitle>

          <DialogClose>
            <IconX className="size-[1.25em]" />
          </DialogClose>
        </div>

        <div className="flex flex-col gap-8 rounded-lg min-h-[25dvh] max-h-[75dvh] overflow-y-auto pr-4 -mr-4">
          <Text>Ved påmelding av dette arrangementet godtar du å følge Onlines arrangementregler beskrevet under.</Text>

          <PenaltyRules variant="compact" />
        </div>
      </DialogContent>
    </Dialog>
  )
}

type EventRulesButtonProps = ButtonProps & {
  withIcon?: boolean
}

export const EventRulesButton = ({ variant = "ghost", withIcon = true, ...props }: EventRulesButtonProps) => {
  return (
    <EventRulesDialog
      trigger={
        <Button variant={variant} {...props}>
          {withIcon && <IconBook2 className="size-4" />}
          Prikkeregler
        </Button>
      }
    />
  )
}
