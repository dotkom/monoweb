import { EntryDetailLayout } from "@/components/layout/EntryDetailLayout"
import { EventList } from "@/components/organisms/EventList"
import type { Committee, Event } from "@dotkomonline/types"
import { Icon } from "@dotkomonline/ui"
import Image from "next/image"
import type { FC } from "react"
import OnlineIcon from "@/components/atoms/OnlineIcon"
import { server } from "@/utils/trpc/server"
import Link from "next/link"
import { CommitteeList } from "@/components/organisms/CommitteeList"

interface CommitteesViewProps {
  committee: Committee
  events: Event[]
}

export const CommitteesView = async () => {

  return (
    <div className="my-8">
      <h1 className="mb-5">
      Velkommen til Onlines komiteer!
      </h1>
      <p>
      Komitémedlemmene våre får Online til å gå rundt, og arbeider for at alle informatikkstudenter skal ha en flott studiehverdag.
      </p>

      <div className="pt-4">
      <CommitteeList />
      </div>
    </div>
  )
}
export default CommitteesView;