import { OnlineIcon } from "@/components/atoms/OnlineIcon"
import type { Group } from "@dotkomonline/types"
import Link from "next/link"
import type { FC } from "react"

export interface CommitteeListItemProps {
  committee: Group
}

export const CommitteeListItem: FC<CommitteeListItemProps> = (props: CommitteeListItemProps) => (
  <div className="p-4 py-8 text-center m-1 shadow-md rounded-lg border-slate-3 border min-w-[250px] flex flex-col">
    <OnlineIcon className="w-5/12 mx-auto max-w-[150px] min-w-[120px]" />
    <h2 className="!text-3xl border-none !mt-4">{props.committee.name}</h2>
    <p className="mt-2 mb-6 text-left px-3">{props.committee.description}</p>
    <Link className="mt-auto text-xl hover:underline" href={`committees/${props.committee.id}`}>
      Les mer
    </Link>
  </div>
)
