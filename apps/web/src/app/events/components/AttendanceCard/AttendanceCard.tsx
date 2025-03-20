"use client"

import { trpc } from "@/utils/trpc/client"
import {
  type Attendance,
  type AttendancePool,
  type Attendee,
  type User,
  canUserRegisterForPool,
} from "@dotkomonline/types"
import { Icon } from "@dotkomonline/ui"
import { useState } from "react"
import { AttendancePoolInfoBox } from "../AttendanceBoxPool"
import ChooseSelectionsForm from "./AttendanceSelectionsDialog"
import { RegistrationButton } from "./RegistrationButton"
import ViewAttendeesDialogButton from "./ViewAttendeesPopup"
import { useDeregisterMutation, useRegisterMutation } from "./mutations"

export const AttendanceCard = ({
  user,
  ...initialData
}: { attendance: Attendance; user?: User; attendee: Attendee | null }) => {
  const { data: attendance, isLoading: attendanceLoading } = trpc.attendance.getAttendance.useQuery(
    {
      id: initialData.attendance.id,
    },
    { initialData: initialData.attendance, enabled: user !== undefined }
  )

  const { data: attendee, isLoading: attendeeLoading } = trpc.attendance.getAttendee.useQuery(
    {
      // biome-ignore lint/style/noNonNullAssertion: Only enabled when user is defined
      userId: user?.id ?? "",
      attendanceId: initialData.attendance.id,
    },
    { initialData: initialData.attendee, enabled: user !== undefined }
  )

  const [, setSelectionsDialogOpen] = useState(false)
  const updateSelectionsMutation = trpc.attendance.updateSelectionResponses.useMutation({})

  const registerMutation = useRegisterMutation({})
  const deregisterMutation = useDeregisterMutation()

  function poolSortKey(pool: AttendancePool) {
    if (attendee && pool.id === attendee.attendanceId) {
      return 1
    }

    if (user && canUserRegisterForPool(pool, user)) {
      return 0
    }

    return -1
  }

  const pools = attendance.pools.sort((a, b) => poolSortKey(b) - poolSortKey(a))
  const attendablePool = user && pools.find((pool) => canUserRegisterForPool(pool, user))

  const [attendeeListOpen, setAttendeeListOpen] = useState(false)

  const registerForAttendance = () =>
    attendablePool && registerMutation.mutate({ attendanceId: attendance.id, attendancePoolId: attendablePool.id })

  const deregisterForAttendance = () =>
    attendablePool && attendee && deregisterMutation.mutate({ attendanceId: attendance.id })

  const isLoading = attendanceLoading || attendeeLoading || deregisterMutation.isLoading || registerMutation.isLoading

  return (
    <section className="flex flex-col bg-slate-2 rounded-3xl min-h-[6rem] mb-8 p-6 gap-3">
      <h2 className="border-none">Påmelding</h2>

      <div className="grid gap-4 grid-cols-2">
        {pools.map((pool) => (
          <AttendancePoolInfoBox
            key={pool.id}
            user={user ?? null}
            pool={pool}
            attendee={attendee}
            attendance={attendance}
          />
        ))}
      </div>

      {user !== undefined && (
        <div className="flex flex-col gap-3">
          <ViewAttendeesDialogButton
            attendanceId={attendance.id}
            attendeeListOpen={attendeeListOpen}
            setAttendeeListOpen={setAttendeeListOpen}
            title={"Påmeldingsliste"}
          />

          {attendablePool && (
            <RegistrationButton
              attendance={attendance}
              attendee={attendee}
              registerForAttendance={registerForAttendance}
              deregisterForAttendance={deregisterForAttendance}
              isLoading={isLoading}
            />
          )}
        </div>
      )}

      {attendee && attendance.selections.length > 0 && (
        <div className="w-full">
          <ChooseSelectionsForm
            selections={attendance.selections}
            defaultValues={{ options: attendee.selections }}
            isLoading={updateSelectionsMutation.isLoading}
            onSubmit={(options) => {
              updateSelectionsMutation.mutate({
                id: attendee.id,
                options,
              })
              setSelectionsDialogOpen(false)
            }}
          />
        </div>
      )}

      <div className="flex flex-row gap-3">
        <p className="text-xs text-slate-9">Avmeldingsfrist 12:00 23.09.2024</p>
      </div>
      <div className="flex flex-row gap-3">
        <a href="/profile">
          <p className="text-xs text-slate-9">
            <Icon className="inline-block align-middle text-lg" icon="tabler:edit" />
            Oppdater matallergier
          </p>
        </a>
        <p className="text-xs text-slate-9">
          <Icon className="inline-block align-middle text-lg" icon="tabler:book-2" />
          Arrangementbregler
        </p>
      </div>
    </section>
  )
}
