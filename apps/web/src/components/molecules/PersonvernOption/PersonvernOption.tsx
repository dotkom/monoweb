import { css, Toggle } from "@dotkomonline/ui"
import { blackA } from "@radix-ui/colors"
import { GridIcon } from "@radix-ui/react-icons"
import { SetStateAction, FC, ReactNode, useState, useEffect } from "react"

import personList from "./PersonvernOption"

interface PersonvernProps {
  children: ReactNode
}

const PersonvernOption: FC<PersonvernProps> = ({ children }) => {
  const [isChecked, setIsChecked] = useState<boolean>(false)

  useEffect(() => {
    console.log(isChecked)
  }, [isChecked])

  return (
    <div className="bg-background w-full">
      <div className="mt-4 flex w-[calc(50%+21px)] min-w-[464px] flex-row justify-between ">
        <p className=" m-0 w-full flex-auto p-1 text-sm font-normal not-italic">{children}</p>
        <div className="w-15 m-0 flex-auto p-0">
          <Toggle label={""} isChecked={isChecked} setIsChecked={setIsChecked}></Toggle>
        </div>
      </div>
      <hr className="border-slate-12 border-1 m-[0.5px] mt-4 w-full p-0 " />
    </div>
  )
}

export default PersonvernOption
