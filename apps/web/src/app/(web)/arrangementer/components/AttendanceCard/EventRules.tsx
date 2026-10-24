import { PenaltyRules } from "@/components/PenaltyRules/PenaltyRules"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogTrigger,
  Button,
  type ButtonProps,
  Text,
  Title,
} from "@dotkomonline/ui"
import { IconScript, IconX } from "@tabler/icons-react"

type EventRulesProps = ButtonProps & {
  withIcon?: boolean
}

export const EventRules = ({ className, variant = "ghost", withIcon = true, ...props }: EventRulesProps) => {
  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button variant={variant} {...props} className={className}>
            {withIcon && <IconScript aria-hidden className="size-4" />}
            Arrangementregler
          </Button>
        }
      />
      <EventRulesDialogContent />
    </Dialog>
  )
}

export const EventRulesDialogContent = () => (
  <DialogContent size="lg">
    <div className="flex flex-row gap-4 justify-between">
      <DialogTitle asChild>
        <Title element="h1" size="lg">
          Arrangementregler
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
)
