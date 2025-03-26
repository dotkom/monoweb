import "@dotkomonline/config/tailwind.css"
import "@fontsource/fraunces"
import "@fontsource/poppins"
import type { GlobalProvider } from "@ladle/react"
import { clsx } from "clsx"

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
