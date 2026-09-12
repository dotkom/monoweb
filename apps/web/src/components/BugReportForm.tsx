import { useState } from "react"
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
import { Section } from "@/app/bedrift/faktura/components/section"

export interface BugReportFormProps {
  bugReportFormOpen: boolean
  setBugReportFormOpen: (open: boolean) => void
}

export const BugReportForm = ({ bugReportFormOpen, setBugReportFormOpen }: BugReportFormProps) => {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")

  const sendEmail = () => {
    const subject = encodeURIComponent(title)
    const body = encodeURIComponent(description)
    window.open(`mailto:dotkom@online.ntnu.no?subject=${subject}&body=${body}`, "_blank", "noopener,noreferrer")
  }

  return (
    <AlertDialog open={bugReportFormOpen} onOpenChange={setBugReportFormOpen}>
      <AlertDialogContent size="lg" className="p-0!" onOutsideClick={() => setBugReportFormOpen(false)}>
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
          <div className="flex flex-col gap-2">
            <Section as="fieldset" className="gap-8">
              <Section>
                <Text>Beskriv feilen kort og tydelig</Text>
                <Section>
                  <TextInput
                    label="Kort tittel"
                    placeholder="F.eks. problem med ..."
                    required={true}
                    value={title}
                    onChange={(event) => setTitle(event.currentTarget.value)}
                  />
                </Section>
                <Section>
                  <Title element="legend">Hva skjedde?</Title>
                  <Textarea
                    label="Fortell hva du gjorde, hva du forventet og hva som faktisk skjedde"
                    placeholder="F.eks. når man gjør ditt og datt så ..."
                    required={true}
                    value={description}
                    onChange={(event) => setDescription(event.currentTarget.value)}
                  />
                </Section>
                <Button size="lg" variant="default" type="submit" onClick={sendEmail}>
                  Send feilen til oss
                </Button>
              </Section>
            </Section>
          </div>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  )
}
