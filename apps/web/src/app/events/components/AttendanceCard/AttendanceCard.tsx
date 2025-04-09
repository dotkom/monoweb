"use client"

import { useTRPC } from "@/utils/trpc/client"
import { type Attendance, type AttendancePool, type Attendee, type User, canUserAttendPool } from "@dotkomonline/types"
import { Icon } from "@dotkomonline/ui"
import { useMutation, useQuery } from "@tanstack/react-query"
import { useState } from "react"
import { AttendanceBoxPool } from "../AttendanceBoxPool"
import ChooseSelectionsForm from "./AttendanceSelectionsDialog"
import { RegistrationButton } from "./RegistrationButton"
import ViewAttendeesDialogButton from "./ViewAttendeesPopup"
import { useDeregisterMutation, useRegisterMutation } from "./mutations"

export const AttendanceCard = ({
  user,
  initialAttendance,
  initialAttendee,
}: { initialAttendance: Attendance; user?: User; initialAttendee: Attendee | null }) => {
  const trpc = useTRPC()
  const { data: attendance, isLoading: attendanceLoading } = useQuery(
    trpc.attendance.getAttendance.queryOptions(
      {
        id: initialAttendance.id,
      },
      { initialData: initialAttendance, enabled: user !== undefined }
    )
  )

  const { data: attendee, isLoading: attendeeLoading } = useQuery(
    trpc.attendance.getAttendee.queryOptions(
      {
        // biome-ignore lint/style/noNonNullAssertion: Disabled when user is undefined
        userId: user?.id!,
        attendanceId: attendance?.id,
      },
      { initialData: initialAttendee, enabled: user !== undefined }
    )
  )

  const [, setSelectionsDialogOpen] = useState(false)
  const updateSelectionsMutation = useMutation(trpc.attendance.updateSelectionResponses.mutationOptions({}))

  const registerMutation = useRegisterMutation({})
  const deregisterMutation = useDeregisterMutation()

  function poolSortKey(pool: AttendancePool) {
    if (attendee && pool.id === attendee.attendanceId) {
      return 1
    }

    if (user && canUserAttendPool(pool, user)) {
      return 0
    }

    return -1
  }

  const pools = attendance.pools.sort((a, b) => poolSortKey(b) - poolSortKey(a))
  const attendablePool = user && pools.find((pool) => canUserAttendPool(pool, user))

  const [attendeeListOpen, setAttendeeListOpen] = useState(false)

  const registerForAttendance = () =>
    attendablePool && registerMutation.mutate({ attendanceId: attendance.id, attendancePoolId: attendablePool.id })

  const deregisterForAttendance = () =>
    attendablePool && attendee && deregisterMutation.mutate({ attendanceId: attendance.id })

  const isLoading = attendanceLoading || attendeeLoading || deregisterMutation.isPending || registerMutation.isPending

  return (
    <section className="flex flex-col bg-slate-2 rounded-3xl min-h-[6rem] mb-8 p-6 gap-3">
      <h2 className="border-none">Påmelding</h2>

      <div className="grid gap-4 grid-cols-2">
        {pools.map((pool) => (
          <AttendanceBoxPool
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
              unregisterForAttendance={deregisterForAttendance}
              isLoading={isLoading}
              enabled={!!attendee}
            />
          )}
        </div>
      )}

      {attendee && attendance.selections.length > 0 && (
        <div className="w-full">
          <ChooseSelectionsForm
            selections={attendance.selections}
            defaultValues={{ options: attendee.selections }}
            isLoading={updateSelectionsMutation.isPending}
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
        <a href="/profile" className="flex flex-row gap-1 items-center text-sm text-slate-9">
          <Icon className="inline-block align-middle text-lg" icon="tabler:edit" />
          Oppdater matallergier
        </a>
        <p className="flex flex-row gap-1 items-center text-sm text-slate-9">
          <Icon className="inline-block align-middle text-lg" icon="tabler:book-2" />
          Arrangementregler
        </p>
      </div>
    </section>
  )
}
