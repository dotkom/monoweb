import DefaultFlag from "./DefaultFlag"
import Flag from "./Flag"

export default {
  title: "atoms/Flag",
  component: Flag,
}

const message = "Nothing to worry about, everything is going great!"

export const Danger = () => (
  <Flag title={"Good news, everyone"} color={"danger"}>
    {message}
  </Flag>
)
export const Warning = () => (
  <Flag title={"Good news, everyone"} color={"warning"}>
    {message}
  </Flag>
)
export const Info = () => (
  <Flag title={"Good news, everyone"} color={"info"}>
    {message}
  </Flag>
)
export const Success = () => (
  <Flag title={"Good news, everyone"} color={"success"}>
    {message}
  </Flag>
)
export const NoColorDanger = () => (
  <DefaultFlag title={"Uh Oh!"} status={"danger"}>
    You need to take action, something has gone terribly wrong!
  </DefaultFlag>
)
export const NoColorWarning = () => (
  <DefaultFlag title={"Uh Oh!"} status={"warning"}>
    Pay attention to me, things are not going according to plan.{" "}
  </DefaultFlag>
)
export const NoColorInfo = () => (
  <DefaultFlag title={"Uh Oh!"} status={"info"}>
    This alert needs your attention, but its not super important.{" "}
  </DefaultFlag>
)
export const NoColorSuccess = () => (
  <DefaultFlag title={"Uh Oh!"} status={"success"}>
    Nothing to worry about, everything is going great!{" "}
  </DefaultFlag>
)
