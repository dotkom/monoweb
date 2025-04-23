import { Text } from "@dotkomonline/ui"
import type { ReactNode } from "react"

export interface Event {
  title: string
  startDate: Date
  endDate: Date
  description: ReactNode
}

export interface TimeLineProps {
  events: Event[] // This means that events is a list of objects with title, date and description
}

const now = Date.now()

export const mockTimeline: TimeLineProps = {
  events: [
    {
      title: "a",
      startDate: new Date(now),
      endDate: new Date(now + 100000),
      description: <Text>Description</Text>,
    },
    {
      title: "b",
      startDate: new Date(now + 10000000),
      endDate: new Date(now + 100000000),
      description: <Text>Description</Text>,
    },
    {
      title: "c",
      startDate: new Date(now + 12000000),
      endDate: new Date(now + 14500000),
      description: <Text>Description</Text>,
    },
  ],
}
