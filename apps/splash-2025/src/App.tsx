import { DebugInfo } from "./components/DebugInfo.tsx"
import { LinjeforeningInfo } from "./components/LinjeforeningInfo.tsx"
import { Events } from "./components/events.tsx"
import { Footer } from "./components/footer"
import { Header } from "./components/header"
import { Hero } from "./components/hero"
import { SponsorPlaceholderIcon } from "./components/icons/SponsorPlaceholderIcon.tsx"
import { HeroData } from "./data/hero"

export function App() {
  return (
    <div className="bg-[#6B1414] min-h-screen">
      <Header />

      <main>
        <Hero {...HeroData} />
        <Events />
        <DebugInfo />
        <div className="bg-brand h-screen">
          <LinjeforeningInfo />
        </div>
      </main>

      <Footer sponsorLogo={<SponsorPlaceholderIcon />} />
    </div>
  )
}
