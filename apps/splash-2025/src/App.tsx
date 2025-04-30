import { Cloud } from "./components/cloud"
import { Header } from "./components/header"

export function App() {
  return (
    <div className="bg-[#6B1414] min-h-screen">
      <Header />

      <main>
        Team onboarding ftw 1
        <Cloud />
      </main>
    </div>
  )
}
