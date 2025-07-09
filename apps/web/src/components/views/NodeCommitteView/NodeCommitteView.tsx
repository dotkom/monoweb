import type { Group } from "@dotkomonline/types"
import type { FC } from "react"

interface NodeCommitteeProps {
  nodeCommittee: Group
}

export const NodeCommitteeView: FC<NodeCommitteeProps> = (props: NodeCommitteeProps) => {
  const { nodeCommittee } = props

  return (
    <div className="p-14 my-16 mx-auto border-slate-200 rounded-lg border shadow-md w-10/12 ">
      <div className="flex md:flex-row flex-col-reverse">
        <div className="mr-4">
          <h2 className="text-lg border-none !mt-4">{nodeCommittee.name}</h2>
          <p className="mt-2">
            {nodeCommittee.longDescription ? nodeCommittee.longDescription : nodeCommittee.description}
          </p>
        </div>
        {nodeCommittee.image && (
          <img
            className="max-w-[200px] min-w-[200px] py-auto ml-auto sm:mb-auto mb-9 mt-2"
            src={nodeCommittee.image}
            alt={nodeCommittee.name}
          />
        )}
      </div>
    </div>
  )
}
