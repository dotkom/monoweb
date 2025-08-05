import { DebugInfo } from "@/components/DebugInfo.js"
import { LinjeforeningInfo } from "@/components/LinjeforeningInfo.js"
import { Footer } from "@/components/footer.js"
import { Hero } from "@/components/hero.js"
import { HeroData } from "@/data/hero.js"
import { QueryClientProvider } from "@tanstack/react-query"
import { BookMark } from "./components/Bookmark"
import { Events } from "./components/events"
import { queryClient } from "./lib/trpc"

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <main className="bg-[#6B1414] min-h-screen">
        <BookMark />
        <Hero {...HeroData} />
        <DebugInfo />
        <LinjeforeningInfo />
        <Events />
        <Footer />
      </main>
    </QueryClientProvider>
  )
}
