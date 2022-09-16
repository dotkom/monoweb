import MonochromeFlag from "./NonCollapsableFlag"
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
  <MonochromeFlag title={"Uh Oh!"} status={"danger"}>
    You need to take action, something has gone terribly wrong!
  </MonochromeFlag>
)
export const NoColorWarning = () => (
  <MonochromeFlag title={"Uh Oh!"} status={"warning"}>
    Pay attention to me, things are not going according to plan.{" "}
  </MonochromeFlag>
)
export const NoColorInfo = () => (
  <MonochromeFlag title={"Uh Oh!"} status={"info"}>
    This alert needs your attention, but its not super important.{" "}
  </MonochromeFlag>
)
export const NoColorSuccess = () => (
  <MonochromeFlag title={"Uh Oh!"} status={"success"}>
    Nothing to worry about, everything is going great!{" "}
  </MonochromeFlag>
)
