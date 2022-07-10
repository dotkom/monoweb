import Flag from "./Flag"
import DefaultFlag from "./DefaultFlag"

export default {
  title: "atoms/Flag",
  component: Flag,
}

export const Default = () => <Flag title={"Good news, everyone"} color={""}></Flag>
export const WhiteFlag = () => (
  <DefaultFlag title={"Uh Oh!"}>You need to take action, something has gone terribly wrong!</DefaultFlag>
)
