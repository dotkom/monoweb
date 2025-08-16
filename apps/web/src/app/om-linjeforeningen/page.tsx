import { OurGoalsCard } from "./components/OurGoals"
import { Statistics } from "./components/Statistics"
import { Structure } from "./components/Structure"
import { WhoAreWeCard } from "./components/WhoAreWeCard"

export default async function AboutOnlinePage() {
  return (
    <div className="flex flex-col gap-24">
      <WhoAreWeCard />
      <Statistics />
      <OurGoalsCard />
      <Structure />
    </div>
  )
}
