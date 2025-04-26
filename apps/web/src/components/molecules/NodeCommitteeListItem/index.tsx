import type { Group } from "@dotkomonline/types"
import Link from "next/link"
import type { FC } from "react"

export interface NodeCommitteeListItemProps {
  nodeCommittee: Group
}

export const NodeCommitteeListItem: FC<NodeCommitteeListItemProps> = (props: NodeCommitteeListItemProps) => (
  <div className="p-4 py-8 text-center m-1 shadow-md rounded-lg border-slate-3 border min-w-[250px] flex flex-col transform transition duration-300 hover:scale-[1.02] animate-fadeIn">
    <img
      className="w-5/12 mx-auto max-w-[150px] min-w-[120px]"
      src={props.nodeCommittee.image ?? undefined}
      alt="Logo"
    />
    <h2 className="!text-3xl border-none !mt-4">{props.nodeCommittee.name}</h2>
    <p className="mt-2 mb-6 text-left px-3">{props.nodeCommittee.description}</p>
    <Link className="mt-auto text-xl hover:underline" href={`nodekomiteer/${props.nodeCommittee.id}`}>
      Les mer
    </Link>
  </div>
)
