import { Text, Title } from "@tremor/react"
import { FC } from "react"
import { Event } from "@dotkomonline/types"

import { FlyoutChildProps } from "../../components/Flyout"

export const EventDetailsFlyout: FC<FlyoutChildProps<Event>> = ({ payload }) => {
  return (
    <div className="w-full p-6">
      <Title>{payload.title}</Title>
      <Text>Lorem ipsum dolor sit amet, consetetur sadipscing elitr.</Text>
    </div>
  )
}
