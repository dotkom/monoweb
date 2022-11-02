import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { App } from "./App"

const element = document.querySelector<HTMLDivElement>("#root")!;
const root = createRoot(element)

root.render(
  <StrictMode>
    <App />
  </StrictMode>
)
