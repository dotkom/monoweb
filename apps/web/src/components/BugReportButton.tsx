import { useState } from "react"
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogTitle, AlertDialogTrigger, Button, Text, Textarea, TextInput, Title } from "@dotkomonline/ui";
import { IconCheck, IconClipboard, IconEmailStamp, IconMail, IconX } from "@tabler/icons-react";
import { Section } from "@/app/bedrift/faktura/components/section"

interface BugReportButtonProps {
  bugReportFormOpen: boolean
  setBugReportFormOpen: (open: boolean) => void
}

export const BugReportButton = ({
  bugReportFormOpen,
  setBugReportFormOpen,
}: BugReportButtonProps) => {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")

  const button = (
    <button
      type="button"
      aria-label="Send bugreport via e-post"
      className="group relative flex flex-row items-center gap-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-stone-800 px-1 -mx-1 py-0.25 -my-0.25 rounded-md hover:-ml-6 hover:pl-6"
    >
      <Text>Ta kontakt med Dotkom</Text>
      <div
        className="pointer-events-none absolute top-1/2 left-1 -translate-y-1/2 invisible group-hover:visible"
        aria-hidden
      >
        <IconMail className="shrink-0 size-4" />
      </div>
    </button>
  )

  const sendEmail = () => {
    const subject = encodeURIComponent(title)
    const body = encodeURIComponent(description)
    window.open(`mailto:dotkom@online.ntnu.no?subject=${subject}&body=${body}`, "_blank", "noopener,noreferrer")
  }

  return (
    <AlertDialog open={bugReportFormOpen} onOpenChange={setBugReportFormOpen}>
      <AlertDialogTrigger asChild>{button}</AlertDialogTrigger>
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