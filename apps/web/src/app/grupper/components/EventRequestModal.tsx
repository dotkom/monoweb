"use client"

import { AlertDialog, AlertDialogContent, Button } from "@dotkomonline/ui"
import { useState } from "react"
import { EventRequestWriteForm } from "./EventRequestWriteForm"
import { cn } from "@dotkomonline/ui"

interface Props {
  interestGroupId: string
  buttonClassName?: string
}

export const EventRequestModal = ({ interestGroupId, buttonClassName }: Props) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Button className={cn(buttonClassName)} onClick={() => setIsOpen(true)} variant="default">
        Send forespørsel om å arrangere et arrangement
      </Button>
      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogContent size="lg" initialFocus={false} onOutsideClick={() => setIsOpen(false)}>
          <EventRequestWriteForm interestGroupId={interestGroupId} />
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
