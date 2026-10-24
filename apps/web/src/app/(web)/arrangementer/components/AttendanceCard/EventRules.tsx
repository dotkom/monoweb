import { PenaltyRules } from "@/components/PenaltyRules/PenaltyRules"
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Button,
  type ButtonProps,
  Text,
  Title,
} from "@dotkomonline/ui"
import { IconBook2, IconX } from "@tabler/icons-react"

type EventRulesProps = ButtonProps & {
  withIcon?: boolean
}

export const EventRules = ({ className, variant = "ghost", withIcon = true, ...props }: EventRulesProps) => {
  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button variant={variant} {...props} className={className}>
            {withIcon && <IconBook2 className="size-4" />}
            Prikkeregler
          </Button>
        }
      />
      <DialogContent size="lg">
        <DialogHeader className="flex-row gap-4 justify-between">
          <DialogTitle asChild>
            <Title element="h1" size="lg">
              Prikkeregler
            </Title>
          </DialogTitle>

          <DialogClose>
            <IconX className="size-[1.25em]" />
          </DialogClose>
        </DialogHeader>

        <DialogBody className="min-h-[25dvh]">
          <div className="flex flex-col gap-8">
            <Text>
              Ved påmelding av dette arrangementet godtar du å følge Onlines arrangementregler beskrevet under.
            </Text>

            <PenaltyRules variant="compact" />
          </div>
        </DialogBody>
      </DialogContent>
    </Dialog>
  )
}
