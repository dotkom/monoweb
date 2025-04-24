import type { EventProps } from "@/data/timelineData"
import { Icon, Text, Title } from "@dotkomonline/ui"
import type { FC } from "react"

export const Event: FC<EventProps> = ({ title, startDate, endDate, description }) => {
  return (
    <div className="grid items-center gap-x-4 grid-cols-[5ch_fit-content(2ch)_auto]">
      <Text>{new Intl.DateTimeFormat("no-nb", { timeStyle: "short" }).format(startDate)}</Text>

      <Icon icon="material-symbols:circle" />

      <Title element="h3">{title}</Title>

      <div className="col-start-3">
        {description}
        <Text>Forventet sluttid: {new Intl.DateTimeFormat("no-nb", { timeStyle: "short" }).format(endDate)}</Text>
      </div>
    </div>
  )
}
