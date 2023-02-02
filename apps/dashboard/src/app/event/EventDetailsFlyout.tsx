import { FC } from "react"
import { Event } from "@dotkomonline/types"

import { FlyoutChildProps } from "../../components/Flyout"

export const EventDetailsFlyout: FC<FlyoutChildProps<Event>> = ({ payload }) => {
  return (
    <div className="w-full p-6">
      <h1>{payload?.title}</h1>
      <p>Lorem ipsum dolor sit amet, consetetur sadipscing elitr.</p>
    </div>
  )
}
