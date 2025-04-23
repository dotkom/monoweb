import type { Event as EventInterface } from "@/data/timelineData"
import { Text, Title } from "@dotkomonline/ui"
import type { FC } from "react"

export const Event: FC<EventInterface> = ({ title, startDate, endDate, description }) => {
  return (
    <div>
      <Title element="h3">{title}</Title>
      <Text>{new Intl.DateTimeFormat("no-nb", { timeStyle: "short" }).format(startDate)}</Text>
      <div>
        {description}
        <Text>Forventet sluttid: {new Intl.DateTimeFormat("no-nb", { timeStyle: "short" }).format(endDate)}</Text>
      </div>
    </div>
  )
}
