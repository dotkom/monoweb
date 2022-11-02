import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

import { App } from "./App"
import "./main.css"

const element = document.querySelector("#root") as HTMLDivElement
const root = createRoot(element)

root.render(
  <StrictMode>
    <App />
  </StrictMode>
)
