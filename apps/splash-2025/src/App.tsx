import { DebugInfo } from "@/components/DebugInfo.tsx"
import { LinjeforeningInfo } from "@/components/LinjeforeningInfo.tsx"
import { Footer } from "@/components/footer.tsx"
import { Hero } from "@/components/hero.tsx"
import { SponsorPlaceholderIcon } from "@/components/icons/SponsorPlaceholderIcon.tsx"
import { HeroData } from "@/data/hero.ts"
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
            <LinjeforeningInfo />
          </div>
        </main>
        <Events />
        <Footer sponsorLogo={<SponsorPlaceholderIcon />} />
      </div>
    </QueryClientProvider>
  )
}
