"use client"

import { ConfirmDeleteModal } from "@/components/molecules/ConfirmDeleteModal/ConfirmDeleteModal"
import { notifyFail } from "@/lib/notifications"
import {
  type Attendance,
  type AttendancePool,
  getReservedAttendeeCount,
  getUnreservedAttendeeCount,
} from "@dotkomonline/rpc/attendance"
import { Button, Text, Title } from "@dotkomonline/ui"
import type { FC } from "react"
import { useState } from "react"
import { useDeletePoolMutation } from "../../../mutations"
import { EditPoolModal } from "./EditPoolModal"
import type { PoolFormValues } from "./PoolForm"
import { formatPoolYearCriterias } from "./utils"

interface NormalPoolBoxProps {
  pool: AttendancePool
  attendance: Attendance
  deleteGroup: (id: string, numAttendees: number) => void
  canEdit: boolean
}

const AttendancePoolCard: FC<NormalPoolBoxProps> = ({ pool, attendance, deleteGroup, canEdit }) => {
  const [editOpen, setEditOpen] = useState(false)
  const reservedAttendeeCount = getReservedAttendeeCount(attendance, pool.id)
  const unreservedAttendeeCount = getUnreservedAttendeeCount(attendance, pool.id)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const defaultValues: PoolFormValues = {
    capacity: pool.capacity,
    title: pool.title,
    yearCriteria: pool.yearCriteria,
    mergeDelayHours: pool.mergeDelayHours,
  }

  return (
    <>
      <div className="mt-4 rounded-md border p-4 shadow-sm">
        <div className="flex flex-col justify-between gap-4">
          <div>
            <Title className="text-base font-semibold">{pool.title}</Title>
            <Text>
              {reservedAttendeeCount} {pool.capacity > 0 ? `/ ${pool.capacity} påmeldte` : "påmeldte (ledige plasser)"}
            </Text>
            {unreservedAttendeeCount > 0 && <Text>{unreservedAttendeeCount} i kø</Text>}
            <div className="h-2" />
            <Text className="text-sm">Årstrinn: {formatPoolYearCriterias(pool.yearCriteria)}</Text>
            <Text className="text-sm">
              Utsettelse:{" "}
              {pool.mergeDelayHours && pool.mergeDelayHours > 0 ? `${pool.mergeDelayHours} timer` : "Ingen utsettelse"}
            </Text>
          </div>
          <div className="flex flex-wrap gap-4">
            <Button type="button" variant="secondary" disabled={!canEdit} onClick={() => setEditOpen(true)}>
              Rediger
            </Button>
            <Button variant="destructive" disabled={!canEdit} onClick={() => setDeleteOpen(true)}>
              Slett
            </Button>
          </div>
        </div>
      </div>
      <EditPoolModal
        open={editOpen}
        onOpenChange={setEditOpen}
        attendanceId={attendance.id}
        poolId={pool.id}
        defaultValues={defaultValues}
      />
      <ConfirmDeleteModal
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={() => deleteGroup(pool.id, reservedAttendeeCount)}
        confirmLabel="Slett"
        cancelLabel="Avbryt"
        title="Slett påmeldingsgruppe"
        description="Er du sikker på at du vil slette denne påmeldingsgruppen?"
      />
    </>
  )
}

interface PoolsBoxProps {
  attendance: Attendance
  canEdit?: boolean
}

export const PoolBox: FC<PoolsBoxProps> = ({ attendance, canEdit = true }) => {
  const deleteGroupMut = useDeletePoolMutation()
  const deleteGroup = (id: string, numAttendees: number) => {
    if (numAttendees > 0) {
      notifyFail({
        title: "Feil",
        message: "Gruppen har deltakere, og kan ikke slettes",
      })
      return
    }

    deleteGroupMut.mutate({
      id,
    })
  }

  return (
    <div className="flex flex-col gap-4 md:flex-row md:flex-wrap">
      {attendance.pools?.map((pool) => (
        <AttendancePoolCard
          key={pool.id}
          pool={pool}
          deleteGroup={deleteGroup}
          attendance={attendance}
          canEdit={canEdit}
        />
      ))}
      {attendance.pools?.length === 0 && <Text className="italic">Ingen påmeldingsgrupper</Text>}
    </div>
  )
}
