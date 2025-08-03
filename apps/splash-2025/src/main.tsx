import { setDefaultOptions as setDateFnsDefaultOptions } from "date-fns"
import { nb } from "date-fns/locale"
import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { App } from "./App.js"
import "@/globals.css"

setDateFnsDefaultOptions({ locale: nb })

const root = document.getElementById("root")

if (!root) {
  throw new Error("Root element not found")
}

// Render the app
createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>
)
