"use client"

import { cn, Text } from "@dotkomonline/ui"
import { IconAlertCircle, IconCheck } from "@tabler/icons-react"

export interface SaveStatusLabels {
  saving?: string
  dirty?: string
  unpersisted?: string
  saved?: string
}

interface SaveStatusProps {
  isSaving: boolean
  isDirty?: boolean
  isPersisted?: boolean
  labels?: SaveStatusLabels
  savingClassName?: string
  savedClassName?: string
}

export const SaveStatus = ({
  isSaving,
  isDirty = false,
  isPersisted = true,
  labels,
  savingClassName,
  savedClassName,
}: SaveStatusProps) => {
  const { saving = "Lagrer…", dirty = "Ulagrede endringer", unpersisted = dirty, saved = "Lagret" } = labels ?? {}

  if (isSaving) {
    return (
      <div className={cn("flex items-center gap-1.5", savingClassName)}>
        <div className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        <Text className="text-sm">{saving}</Text>
      </div>
    )
  }

  if (isDirty) {
    return (
      <div className="flex items-center gap-1.5 text-yellow-700">
        <IconAlertCircle size={16} />
        <Text className="text-sm">{dirty}</Text>
      </div>
    )
  }

  if (!isPersisted) {
    return (
      <div className="flex items-center gap-1.5 text-yellow-700">
        <IconAlertCircle size={16} />
        <Text className="text-sm">{unpersisted}</Text>
      </div>
    )
  }

  return (
    <div className={cn("flex items-center gap-1.5 text-green-600", savedClassName)}>
      <IconCheck size={16} />
      <Text className="text-sm">{saved}</Text>
    </div>
  )
}
