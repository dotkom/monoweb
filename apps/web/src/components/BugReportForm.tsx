import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogTitle,
  Button,
  Text,
  Textarea,
  TextInput,
  Title,
} from "@dotkomonline/ui"
import { IconX } from "@tabler/icons-react"
import { useForm } from "react-hook-form"

export interface BugReportFormProps {
  isBugReportFormOpen: boolean
  setIsBugReportFormOpen: (open: boolean) => void
}

type BugReportFormValues = {
  title: string
  description: string
}

export const BugReportForm = ({ isBugReportFormOpen, setIsBugReportFormOpen }: BugReportFormProps) => {
  const { register, handleSubmit } = useForm<BugReportFormValues>({
    defaultValues: {
      title: "",
      description: "",
    },
  })

  const sendEmail = ({ title, description }: BugReportFormValues) => {
    const subject = encodeURIComponent(title)
    const body = encodeURIComponent(description)
    window.open(`mailto:dotkom@online.ntnu.no?subject=${subject}&body=${body}`, "_blank", "noopener,noreferrer")
  }

  return (
    <AlertDialog open={isBugReportFormOpen} onOpenChange={setIsBugReportFormOpen}>
      <AlertDialogContent size="lg" className="p-0!" onOutsideClick={() => setIsBugReportFormOpen(false)}>
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
          <form onSubmit={handleSubmit(sendEmail)} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Text>Beskriv feilen kort og tydelig</Text>
              <TextInput
                label="Kort tittel"
                placeholder="Jeg får ikke meldt meg på et arrangement"
                required={true}
                {...register("title")}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Title element="legend">Hva skjedde?</Title>
              <Textarea
                label="Fortell hva du gjorde, hva du forventet og hva som faktisk skjedde"
                placeholder="Jeg prøvde å melde meg på ITEX, men fikk feilmeldingen..."
                required={true}
                {...register("description")}
              />
            </div>
            <Button size="lg" variant="default" type="submit">
              Send
            </Button>
          </form>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  )
}
