import type { GlobalProvider } from "@ladle/react"
import { cn } from "@dotkomonline/ui"
import "@fontsource-variable/figtree/wght.css"
import "@fontsource-variable/inter/wght.css"
import "@fontsource-variable/google-sans-code/wght.css"
import "../src/globals.css"

const LIGHT_BACKGROUND = "white"
const DARK_BACKGROUND = "#1c1917"

export const Provider: GlobalProvider = ({ children, globalState }) => {
  const isDark = globalState.theme === "dark"

  return (
    <div
      className={cn("p-6 rounded-lg min-h-screen text-foreground", isDark && "dark")}
      data-theme={globalState.theme}
      style={{
        backgroundColor: isDark ? DARK_BACKGROUND : LIGHT_BACKGROUND,
      }}
    >
      {children}
    </div>
  )
}
