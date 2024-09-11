import type { AttendancePool } from "@dotkomonline/types"
import type { FC } from "react"

interface Props {
  pool: AttendancePool | undefined | null
  isAttending: boolean
}

export const AttendanceBoxPool: FC<Props> = ({ pool, isAttending }) => {
  if (!pool) {
    return (
      <div className="flex flex-col w-full bg-slate-3 rounded-lg">
        <div className="px-8 pt-2 pb-2 bg-slate-5 rounded-t-lg text-center text-sm uppercase font-bold">
          Ingen gruppe
        </div>
        <div className="px-8 py-4 flex flex-col items-center justify-center min-h-[6rem]">
          <p>Du kan ikke melde deg på dette arrangementet</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col w-full bg-slate-3 rounded-2xl">
      <div className="px-8 pt-2 pb-1 bg-slate-5 rounded-t-2xl text-center text-sm font-bold">{pool.title}</div>
      <div className="px-8 py-4 rounded-b-2xl flex flex-col gap-2 items-center justify-center min-h-[6rem]">
        <p className="text-3xl">
          {pool.numAttendees}/{pool.capacity}
        </p>
        <p>{isAttending ? 'Du er påmeldt' : 'Du er ikke påmeldt'}</p>
      </div>
    </div>
  )
}
