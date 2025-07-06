import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { App } from "./App.js"
import "@/globals.css"

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
