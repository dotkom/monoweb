import type { AttendancePool } from "@dotkomonline/types"
import type { FC } from "react"

interface Props {
  pool: AttendancePool
}

export const AttendanceBoxPool: FC<Props> = ({ pool }) => {
  return (
    <div className="flex flex-col w-full bg-slate-3 rounded-2xl">
      <div className="px-8 pt-2 pb-1 bg-slate-5 rounded-t-2xl text-center text-sm font-bold">{pool.title}</div>
      <div className="px-8 py-4 rounded-b-2xl flex flex-col gap-2 items-center">
        <p className="text-3xl">
          {pool.numAttendees}/{pool.capacity}
        </p>
        <p>Du er ikke påmeldt</p>
      </div>
    </div>
  )
}
