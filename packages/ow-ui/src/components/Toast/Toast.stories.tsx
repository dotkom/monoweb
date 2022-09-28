import Toast from "./Toast"
import toast from "react-hot-toast"

// to use the toast component you have to call the toast function from "react-hot-toast"
const notify = () => toast("")

export default {
  title: "atoms/Toast",
  component: Toast,
}

export const Danger = () => (
  <div>
    <button onClick={notify}>Make me a toast</button>
    <Toast status={"danger"}>Uh Oh!</Toast>
  </div>
)

export const ColorlessDanger = () => (
  <div>
    <button onClick={notify}>Make me a toast</button>
    <Toast status={"danger"} monochrome={true}>
      Uh Oh!
    </Toast>
  </div>
)

export const Success = () => (
  <div>
    <button onClick={notify}>Make me a toast</button>
    <Toast status={"success"}>Uh Oh!</Toast>
  </div>
)

export const ColorlessSuccess = () => (
  <div>
    <button onClick={notify}>Make me a toast</button>
    <Toast status={"success"} monochrome={true}>
      Uh Oh!
    </Toast>
  </div>
)

export const Warning = () => (
  <div>
    <button onClick={notify}>Make me a toast</button>
    <Toast status={"warning"}>Uh Oh!</Toast>
  </div>
)

export const ColorlessWarning = () => (
  <div>
    <button onClick={notify}>Make me a toast</button>
    <Toast status={"warning"} monochrome={true}>
      Uh Oh!
    </Toast>
  </div>
)

export const Info = () => (
  <div>
    <button onClick={notify}>Make me a toast</button>
    <Toast status={"info"}>Uh Oh!</Toast>
  </div>
)

export const ColorlessInfo = () => (
  <div>
    <button onClick={notify}>Make me a toast</button>
    <Toast status={"info"} monochrome={true}>
      Uh Oh!
    </Toast>
  </div>
)
