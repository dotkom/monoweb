import type { Group } from "@dotkomonline/types"
import Image from "next/image"
import type { FC } from "react"

interface OtherGroupViewProps {
  otherGroup: Group
}

export const OtherGroupView: FC<OtherGroupViewProps> = (props: OtherGroupViewProps) => {
  const { otherGroup } = props

  return (
    <div className="p-14 my-16 mx-auto border-gray-200 rounded-lg border shadow-md w-10/12 ">
      <div className="flex md:flex-row flex-col-reverse">
        <div className="mr-4">
          <h2 className="text-lg border-none !mt-4">{otherGroup.name}</h2>
          <p className="mt-2">{otherGroup.longDescription ? otherGroup.longDescription : otherGroup.description}</p>
        </div>

        <div className="max-w-[200px] min-w-[200px] py-auto ml-auto sm:mb-auto mb-9 mt-2">
          {otherGroup.image && <Image fill src={otherGroup.image} alt={otherGroup.name} />}
        </div>
      </div>
    </div>
  )
}
