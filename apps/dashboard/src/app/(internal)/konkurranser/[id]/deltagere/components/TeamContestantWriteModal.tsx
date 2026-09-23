"use client"

import { UserCombobox, type UserMemberOption } from "@/app/(internal)/brukere/components/UserCombobox"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogTitle,
  Button,
  TextInput,
} from "@dotkomonline/ui"
import { IconX } from "@tabler/icons-react"
import { useEffect, useMemo, useRef, useState } from "react"

type TeamContestantWriteModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  submitLabel: string
  excludeUserIds: string[]
  initialTeamName?: string
  initialMembers?: UserMemberOption[]
  requireMembers?: boolean
  disabled?: boolean
  isPending?: boolean
  onSubmit: (data: { teamName: string; memberIds: string[] }) => void
}

export function TeamContestantWriteModal({
  open,
  onOpenChange,
  title,
  submitLabel = "Lagre",
  excludeUserIds,
  initialTeamName = "",
  initialMembers = [],
  requireMembers = false,
  disabled,
  isPending,
  onSubmit,
}: TeamContestantWriteModalProps) {
  const [teamName, setTeamName] = useState("")
  const [teamMembers, setTeamMembers] = useState<UserMemberOption[]>([])
  const [originalMemberIds, setOriginalMemberIds] = useState<string[]>([])
  const initialTeamNameRef = useRef(initialTeamName)
  const initialMembersRef = useRef(initialMembers)
  initialTeamNameRef.current = initialTeamName
  initialMembersRef.current = initialMembers

  useEffect(() => {
    if (!open) {
      setTeamName("")
      setTeamMembers([])
      setOriginalMemberIds([])
      return
    }

    const members = initialMembersRef.current
    setTeamName(initialTeamNameRef.current)
    setTeamMembers(members)
    setOriginalMemberIds(members.map((member) => member.id))
  }, [open])

  const pickerExcludeIds = useMemo(() => {
    const searchableIds = new Set([...originalMemberIds, ...teamMembers.map((member) => member.id)])

    return excludeUserIds.filter((id) => !searchableIds.has(id))
  }, [excludeUserIds, originalMemberIds, teamMembers])

  const handleSubmit = () => {
    const trimmed = teamName.trim()
    if (trimmed === "") {
      return
    }

    if (requireMembers && teamMembers.length === 0) {
      return
    }

    onSubmit({
      teamName: trimmed,
      memberIds: teamMembers.map((member) => member.id),
    })
  }

  const canSubmit = !disabled && teamName.trim() !== "" && (!requireMembers || teamMembers.length > 0) && !isPending

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent size="md" onOutsideClick={() => onOpenChange(false)}>
        <div className="flex flex-row items-center justify-between gap-4">
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogCancel type="button">
            <IconX className="size-5" />
          </AlertDialogCancel>
        </div>

        <div className="flex flex-col gap-4">
          <TextInput
            label="Lagnavn"
            placeholder="Skriv inn lagnavn..."
            value={teamName}
            onChange={(event) => {
              setTeamName(event.target.value)
            }}
            required
            disabled={disabled}
          />

          <UserCombobox
            excludeUserIds={pickerExcludeIds}
            label="Medlemmer"
            onChange={setTeamMembers}
            placeholder="Søk etter medlemmer…"
            value={teamMembers}
            disabled={disabled}
          />

          <AlertDialogFooter>
            <AlertDialogCancel type="button" disabled={isPending}>
              Avbryt
            </AlertDialogCancel>
            <Button type="button" variant="default" disabled={!canSubmit} onClick={handleSubmit}>
              {submitLabel}
            </Button>
          </AlertDialogFooter>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  )
}
