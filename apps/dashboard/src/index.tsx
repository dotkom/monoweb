import { createRoot } from "react-dom/client"
import { StrictMode } from "react"
import { QueryProvider } from "./components/QueryProvider"
import { App } from "./app"
import './index.css'

const root = document.querySelector<HTMLDivElement>("#root")
if (root === null) {
  throw new Error("missing dom root")
}

createRoot(root).render(
  <StrictMode>
    <QueryProvider>
      <App />
    </QueryProvider>
  </StrictMode>
)
