import { Toggle } from "@dotkomonline/ui";
import { type FC, type ReactNode } from "react";

interface PrivacyProps {
  children: ReactNode;
}

const PrivacyOption: FC<PrivacyProps> = ({ children }) => (
  // const [isChecked, setIsChecked] = useState<boolean>(false)

  <div className="w-full">
    <div className="mb-4 mt-5 flex flex-row justify-around ">
      <p className="w-full flex-auto p-1 text-sm font-normal not-italic">
        {children}
      </p>
      <div className="w-1/3 flex justify-center items-center">
        {/* <Toggle label={""} isChecked={isChecked} setIsChecked={setIsChecked}></Toggle>      !!!!! BYTTES NÅR TOGGLETING SKAL BRUKES !!!!!*/}
        <Toggle />
      </div>
    </div>
  </div>
);

export default PrivacyOption;
