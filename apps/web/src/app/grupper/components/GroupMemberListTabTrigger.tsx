"use client"

import { TabsTrigger } from "@dotkomonline/ui"

interface GroupMemberListTabTriggerProps {
  value: string
  label: string
  count: number
}

export const GroupMemberListTabTrigger = ({ value, label, count }: GroupMemberListTabTriggerProps) => {
  return (
    <TabsTrigger
      value={value}
      className="data-active:bg-gray-100 dark:data-active:bg-stone-700 not-data-active:hover:bg-gray-100 dark:not-data-active:hover:bg-stone-800 text-gray-700 dark:text-stone-300 py-4 px-8"
    >
      {label}
      <span className="max-md:hidden text-gray-500 dark:text-stone-400 text-sm">({count})</span>
    </TabsTrigger>
  )
}
