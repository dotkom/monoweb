"use client"

import { ConfirmDeleteModal } from "@/components/molecules/ConfirmDeleteModal/ConfirmDeleteModal"
import { useTRPC } from "@/lib/trpc-client"
import type { Attendance, AttendanceSelection } from "@dotkomonline/rpc/attendance"
import { Button, Title } from "@dotkomonline/ui"
import { IconEdit, IconTrash } from "@tabler/icons-react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { useEventContext } from "../provider"
import { CreateAttendanceSelectionsModal } from "./components/CreateAttendanceSelectionsModal"
import { EditAttendanceSelectionsModal } from "./components/EditAttendanceSelectionsModal"
import { useUpdateAttendanceMutation } from "../../mutations"
import { useEventEditPermission } from "../../use-event-edit-permission"

export default function EventSelectionsPage() {
  const { attendance } = useEventContext()
  if (!attendance) {
    return (
      <div>
        <Title className="text-base font-medium">Ingen påmelding</Title>
        <p className="mt-2 text-sm">Opprett en påmelding før du kan legge til valg.</p>
      </div>
    )
  }

  return <SelectionsPageDetail attendance={attendance} />
}

interface Props {
  attendance: Attendance
}

export const SelectionsPageDetail = ({ attendance }: Props) => {
  const { canEdit } = useEventEditPermission()
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const [createOpen, setCreateOpen] = useState(false)
  const [editSelection, setEditSelection] = useState<AttendanceSelection | null>(null)
  const [deleteSelectionId, setDeleteSelectionId] = useState<string | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const updateAttendance = useUpdateAttendanceMutation()

  const { data: results, isLoading: resultsIsLoading } = useQuery({
    ...trpc.event.attendance.getSelectionsResults.queryOptions({
      attendanceId: attendance.id,
    }),
    initialData: [],
  })

  const onDelete = (selectionId: string) => {
    const newOptions = attendance.selections?.filter((selection) => selection.id !== selectionId)
    updateAttendance.mutate(
      {
        id: attendance.id,
        attendance: {
          selections: newOptions ?? [],
        },
      },
      {
        onSuccess: async () => {
          await queryClient.invalidateQueries({
            queryKey: trpc.event.attendance.getSelectionsResults.queryKey({
              attendanceId: attendance.id,
            }),
          })
        },
      }
    )

    setDeleteSelectionId(null)
    setDeleteOpen(false)
  }

  const selectionsResults = resultsIsLoading ? (
    <p>Laster...</p>
  ) : results === null ? (
    <div>Ingen valg</div>
  ) : (
    <div>
      {results.map((result) => (
        <div key={result.id}>
          <h2>
            {result.name} - ({result.totalCount}) svar
          </h2>
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="text-left">Valg</th>
                <th className="w-25 text-left">Antall</th>
              </tr>
            </thead>
            <tbody>
              {result.options.map((option) => (
                <tr key={option.id}>
                  <td>{option.name}</td>
                  <td>{option.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  )

  return (
    <div>
      <div>
        <Title className="text-xl">Valg</Title>
        {!attendance.selections?.length && <p>Ingen valg er lagt til</p>}
        <div>
          {attendance.selections?.map((selection) => (
            <div key={selection.id} className="mt-4 rounded-md border p-4">
              <div className="mb-2 flex gap-2">
                <Button variant="outline" size="icon" disabled={!canEdit} onClick={() => setEditSelection(selection)}>
                  <IconEdit />
                </Button>
                <Button
                  variant="destructive"
                  size="icon"
                  disabled={!canEdit}
                  onClick={() => {
                    setDeleteSelectionId(selection.id)
                    setDeleteOpen(true)
                  }}
                >
                  <IconTrash />
                </Button>
              </div>
              <h3>{selection.name}</h3>
              {selection.options.map((option) => (
                <div key={option.id}>
                  <p>{option.name}</p>
                </div>
              ))}
            </div>
          ))}
        </div>

        <Button variant="default" className="mt-4" disabled={!canEdit} onClick={() => setCreateOpen(true)}>
          Legg til nytt valg
        </Button>
      </div>
      <hr className="my-8" />
      <div>
        <Title size="md"> Resultater</Title>
        {selectionsResults}
      </div>

      <CreateAttendanceSelectionsModal open={createOpen} onOpenChange={setCreateOpen} attendance={attendance} />
      {editSelection && (
        <EditAttendanceSelectionsModal
          open={Boolean(editSelection)}
          onOpenChange={(open) => {
            if (!open) {
              setEditSelection(null)
            }
          }}
          attendance={attendance}
          existingSelection={editSelection}
        />
      )}

      <ConfirmDeleteModal
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={() => onDelete(deleteSelectionId ?? "")}
        title="Slett valg"
        description="Er du sikker på at du vil slette dette valget?"
        confirmLabel="Slett"
        cancelLabel="Avbryt"
      />
    </div>
  )
}
