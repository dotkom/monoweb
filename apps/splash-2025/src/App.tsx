import { DebugInfo } from "@/components/DebugInfo.js"
import { LinjeforeningInfo } from "@/components/LinjeforeningInfo.js"
import { Footer } from "@/components/footer.js"
import { Hero } from "@/components/hero.js"
import { SponsorPlaceholderIcon } from "@/components/icons/SponsorPlaceholderIcon.js"
import { HeroData } from "@/data/hero.js"
import { QueryClientProvider } from "@tanstack/react-query"
import { Events } from "./components/events"
import { Header } from "./components/header"
import { queryClient } from "./lib/trpc"

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="bg-[#6B1414] min-h-screen">
        <Header />
        <main>
          <Hero {...HeroData} />
          <DebugInfo />
          <div className="bg-brand">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 32" role="img" aria-labelledby="desc">
              <desc id="desc">A decorative slant</desc>
              <path fill="white" fill-opacity="1" d="M0,32L1440,0L1440,0L0,0Z" />
            </svg>
            <LinjeforeningInfo />
          </div>
        </main>
        <Events />
        <Footer sponsorLogo={<SponsorPlaceholderIcon />} />
      </div>
    </QueryClientProvider>
  )
}
