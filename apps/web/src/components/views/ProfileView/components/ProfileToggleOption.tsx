import { Toggle } from "@dotkomonline/ui"
import { FC, ReactNode } from "react"

interface PrivacyProps {
  children: ReactNode
}

const PrivacyOption: FC<PrivacyProps> = ({ children }) => {
  // const [isChecked, setIsChecked] = useState<boolean>(false)

  return (
    <div className="w-full">
      <div className="mb-4 mt-5 flex w-[calc(50%+21px)] min-w-[464px] flex-row justify-between ">
        <p className=" m-0 w-full flex-auto p-1 text-sm font-normal not-italic">{children}</p>
        <div className="w-15 m-0 flex-auto p-0">
          {/* <Toggle label={""} isChecked={isChecked} setIsChecked={setIsChecked}></Toggle>      !!!!! BYTTES NÅR TOGGLETING SKAL BRUKES !!!!!*/}
          <Toggle></Toggle>
        </div>
      </div>
    </div>
  )
}

export default PrivacyOption
