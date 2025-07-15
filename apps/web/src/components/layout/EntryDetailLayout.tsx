import { cn } from "@dotkomonline/ui"
import type { FC, PropsWithChildren } from "react"

export interface EntryDetailLayoutProps {
  title: string
  type: string | null
  color?: "AMBER" | "BLUE" | "GREEN"
}

export const EntryDetailLayout: FC<PropsWithChildren<EntryDetailLayoutProps>> = ({
  children,
  title,
  type,
  color = "BLUE",
}) => {
  const borderColorClass = cn({
    "border-blue-700": color === "BLUE",
    "border-green-700": color === "GREEN",
    "border-amber-700": color === "AMBER",
  })
  const textColorClass = cn({
    "text-blue-950": color === "BLUE",
    "text-green-950": color === "GREEN",
    "text-amber-950": color === "AMBER",
  })

  return (
    <div className="mx-auto mb-20 flex w-[90vw] max-w-screen-lg flex-col gap-y-16">
      <div className="flex flex-col gap-y-7">
        <div className={cn("flex w-full items-end justify-between gap-x-2 border-b-2 pb-2", borderColorClass)}>
          <h1>{title}</h1>
          {type && <div className={cn("text-2xl", textColorClass)}>{type}</div>}
        </div>
        {children}
      </div>
    </div>
  )
}
