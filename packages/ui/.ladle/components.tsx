import type { GlobalProvider } from "@ladle/react"
import { clsx } from "clsx"
import "@fontsource/fraunces"
import "@fontsource/poppins"
import "../../config/tailwind.css"

export const Provider: GlobalProvider = ({ children, globalState }) => (
  <div className={clsx(globalState.theme === "dark" && "dark")} data-theme={globalState.theme}>
    {children}
  </div>
)

export const argTypes = {
  background: {
    control: { type: "background" },
    options: ["white", "black", "#BDBDBD"],
    defaultValue: "#BDBDBD",
  },
}
