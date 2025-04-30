import type { Event as EventProps } from "@dotkomonline/types"
import { Icon, Text, Title } from "@dotkomonline/ui"
import type { FC } from "react"

export const Event: FC<EventProps> = ({ title, start, end, description }) => {
  return (
    <div className="grid items-center gap-x-4 grid-cols-[5ch_fit-content(2ch)_auto]">
      <Text>{new Intl.DateTimeFormat("no-nb", { timeStyle: "short" }).format(start)}</Text>

      <Icon icon="material-symbols:circle" className="col-start-2 row-start-1" />

      <div className="col-start-2 row-start-1 row-span-3 absolute border-white" />

      <Title element="h3">{title}</Title>

      <div className="col-start-3">
        {description}
        <Text>Forventet sluttid: {new Intl.DateTimeFormat("no-nb", { timeStyle: "short" }).format(end)}</Text>
      </div>
    </div>
  )
}
