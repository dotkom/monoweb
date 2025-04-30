import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { App } from "./App.tsx"
import "@/globals.css"
import { QueryClientProvider } from "@tanstack/react-query"
import { queryClient } from "./lib/trpc.ts"

const root = document.getElementById("root")

if (!root) {
  throw new Error("Root element not found")
}

// Render the app
createRoot(root).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>
)
