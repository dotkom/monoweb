import { createRoot } from "react-dom/client"
import { StrictMode } from "react"
import { EuiProvider } from "@elastic/eui"
import { QueryProvider } from "./components/QueryProvider"
import "@elastic/eui/dist/eui_theme_light.css"
import { RouterProvider } from "@tanstack/react-router"
import { router } from "./router"
import "./eui.mjs"

const root = document.querySelector<HTMLDivElement>("#root")
if (root === null) {
  throw new Error("missing dom root")
}

createRoot(root).render(
  <StrictMode>
    <QueryProvider>
      <EuiProvider colorMode="light">
        <RouterProvider router={router} />
      </EuiProvider>
    </QueryProvider>
  </StrictMode>
)
