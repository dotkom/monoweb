"use client"

import { useAuthorization } from "@admin/auth/authorization-context"
import { ApplicationWriteForm } from "../ApplicationWriteForm"
import { useApplicationContext } from "./layout"

export default function ApplicationInfoPage() {
  const { application } = useApplicationContext()
  const { canEditApplication } = useAuthorization()
  const canEdit = canEditApplication()

  return (
    <ApplicationWriteForm
      onSubmit={() => {}}
      disabled={!canEdit}
      defaultValues={{
        name: application.name,
        applicationsStart: application.applicationsStart,
        applicationsEnd: application.applicationsEnd,
        interviewStartDate: application.interviewStartDate,
        interviewEndDate: application.interviewEndDate,
        dayStartMinutes: application.dayStartMinutes,
        dayEndMinutes: application.dayEndMinutes,
        slotLengthMinutes: application.slotLengthMinutes,
        isDraft: application.isDraft,
        isLocked: application.isLocked,
      }}
      submitLabel="Oppdater opptak"
    />
  )
}
