"use client"

import { formatDate } from "date-fns"
import { nb } from "date-fns/locale"

export function DayHeader({ date }: { date: Date }) {
  const weekday = formatDate(date, "EEE", { locale: nb }).replace(".", "")

  return (
    <div className="flex flex-col items-center gap-0.5 py-2 font-normal">
      <span className="text-xs uppercase tracking-wider text-gray-500 dark:text-stone-400">{weekday}</span>
      <span className="text-lg text-gray-900 dark:text-stone-100">{formatDate(date, "d")}</span>
    </div>
  )
}
