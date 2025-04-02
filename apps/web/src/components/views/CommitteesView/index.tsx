import { CommitteeList } from "@/components/organisms/CommitteeList"
import type { Event, Group } from "@dotkomonline/types"

interface CommitteesViewProps {
  committee: Group
  events: Event[]
}

export const CommitteesView = async () => {
  return (
    <div className="my-8">
      <h1 className="mb-5">Velkommen til Onlines komiteer!</h1>
      <p>
        Komitémedlemmene våre får Online til å gå rundt, og arbeider for at alle informatikkstudenter skal ha en flott
        studiehverdag.
      </p>

      <div className="pt-4">
        <CommitteeList />
      </div>
    </div>
  )
}
export default CommitteesView
