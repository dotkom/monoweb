import { FC } from "react"
import { Event } from "@dotkomonline/types"
import { Text, Title } from "@dotkomonline/ui"

import { FlyoutChildProps } from "../../components/Flyout"

export const EventDetailsFlyout: FC<FlyoutChildProps<Event>> = ({ payload }) => {
  return (
    <div className="w-full p-6">
      <Title>{payload?.title}</Title>
      <Text>Lorem ipsum dolor sit amet, consetetur sadipscing elitr.</Text>
    </div>
  )
}
