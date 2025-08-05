import { DebugInfo } from "@/components/DebugInfo.js"
import { LinjeforeningInfo } from "@/components/LinjeforeningInfo.js"
import { Footer } from "@/components/footer.js"
import { Hero } from "@/components/hero.js"
import { HeroData } from "@/data/hero.js"
import { QueryClientProvider } from "@tanstack/react-query"
import { Events } from "./components/events"
import { Header } from "./components/header"
import { queryClient } from "./lib/trpc"

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <main className="bg-[#6B1414] min-h-screen">
        <Header />
        <Hero {...HeroData} />
        <DebugInfo />
        <div className="relative bg-brand">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 32" role="img" aria-labelledby="desc">
            <desc id="desc">A decorative slant</desc>
            <path fill="white" fill-opacity="1" d="M0,32L1440,0L1440,0L0,0Z" />
          </svg>
          <LinjeforeningInfo />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1440 32"
            role="img"
            aria-labelledby="desc"
            className="block"
          >
            <desc id="desc">A decorative slant</desc>
            {/* #ffedd4 is Tailwind's orange-100 */}
            <path fill="#ffedd4" d="M1440,0.5L0,32L0,32L1440,32Z" />
          </svg>
          {/* Line to hide pixel gap under svg */}
          <div className="absolute bottom-0 left-0 w-full h-px bg-orange-100 pointer-events-none" />
        </div>
        <Events />
        <Footer />
      </main>
    </QueryClientProvider>
  )
}
