interface AttendanceGroupProps {
  title: string
  numberOfPeople: number
  totalSpots: number
  className?: string
  isAttending: boolean
  canAttend: boolean
}

export const AttendanceGroup = ({
  title,
  numberOfPeople,
  totalSpots,
  className,
  isAttending,
  canAttend,
}: AttendanceGroupProps) => (
  <div className={className}>
    {canAttend && <div className="bg-slate-6 rounded-t-lg py-2 text-center">Din gruppe</div>}
    <div className="bg-slate-4 rounded-b-lg py-4">
      <p className="text-center text-sm font-bold">{title}</p>
      <p className="text-center text-lg font-semibold">
        {numberOfPeople}/{totalSpots}
      </p>
      <div className="mt-2">
        {canAttend && <p className="text-center text-xs">{isAttending ? "Du er påmeldt" : "Du er ikke påmeldt"}</p>}
      </div>
    </div>
  </div>
)
