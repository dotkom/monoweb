import { ComingEvent } from "./ComingEvent"

export default {
  title: "molecules/ComingEvent",
  component: ComingEvent,
}

export const SingleEvent = () => (
  <ComingEvent
    title="Jo sin bursdag"
    tag="sosialt"
    attending={0}
    max_attending={30}
    date="31 mai"
    img="https://handletheheat.com/wp-content/uploads/2015/03/Best-Birthday-Cake-with-milk-chocolate-buttercream-SQUARE.jpg"
    info_link="https://google.com"
  />
)
