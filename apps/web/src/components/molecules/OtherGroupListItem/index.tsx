import type { Group } from "@dotkomonline/types"
import Link from "next/link"
import type { FC } from "react"

export interface OtherGroupListItemProps {
  otherGroup: Group
}

export const OtherGroupListItem: FC<OtherGroupListItemProps> = ({ otherGroup }) => (
  <div className="p-4 mx-6 py-8 text-center m-1 shadow-md rounded-lg border-slate-3 border min-w-[250px] flex flex-col">
    <div className="w-32 h-32 mx-auto flex items-center justify-center">
      {otherGroup.image && (
        <img className="max-w-full max-h-full object-contain" src={otherGroup.image} alt={otherGroup.name} />
      )}
    </div>

    <h2 className="!text-3xl border-none !mt-4">{otherGroup.name}</h2>
    <p className="mt-2 mb-6 text-left px-3">{otherGroup.description}</p>
    <Link className="mt-auto text-xl hover:underline" href={`other-groups/${otherGroup.id}`}>
      Les mer
    </Link>
  </div>
)
