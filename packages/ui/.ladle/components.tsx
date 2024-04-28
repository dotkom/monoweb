import "@dotkomonline/config/tailwind.css"
import type { GlobalProvider } from "@ladle/react"

export const Provider: GlobalProvider = ({ children, globalState }) => (
  <div
    className={globalState.theme === "dark" ? "dark max-w-screen-lg" : "max-w-screen-lg"}
    data-theme={globalState.theme}
  >
    {children}
  </div>
)
