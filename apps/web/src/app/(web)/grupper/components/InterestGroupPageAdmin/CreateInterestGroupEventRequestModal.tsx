"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@dotkomonline/ui"
import {
  InterestGroupEventRequestWriteForm,
  type InterestGroupEventRequestWriteFormValues,
} from "./InterestGroupEventRequestWriteForm"

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (values: InterestGroupEventRequestWriteFormValues) => void
  onFileUpload: (file: File) => Promise<string>
}

export const CreateInterestGroupEventRequestModal = ({ open, onOpenChange, onSubmit, onFileUpload }: Props) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open && (
        <DialogContent
          size="2xl"
          initialFocus={false}
          className="max-h-[85dvh] overflow-y-auto data-[size=2xl]:max-w-4xl"
        >
          <DialogHeader>
            <DialogTitle>Søk om å arrangere et arrangement</DialogTitle>
          </DialogHeader>

          <InterestGroupEventRequestWriteForm onSubmit={onSubmit} onFileUpload={onFileUpload} />
        </DialogContent>
      )}
    </Dialog>
  )
}
