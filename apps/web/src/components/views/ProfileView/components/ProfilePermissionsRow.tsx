import { Toggle } from "@dotkomonline/ui"
import { blackA } from "@radix-ui/colors"
import { GridIcon } from "@radix-ui/react-icons"
import { SetStateAction, FC, ReactNode, useState, useEffect } from "react"
import PermissionOption from "./ProfilePermissionsOption"

interface PermissionProps {
  children: ReactNode
}

const PermissionRow: FC<PermissionProps> = ({ children }) => {
  const [isChecked, setIsChecked] = useState<boolean>(false)

  useEffect(() => {
    console.log(isChecked)
  }, [isChecked])

  return (
    <div className="w-full">
        <div className="col-span-4 mt-1">{children}</div>
        <PermissionOption />
        <PermissionOption />
    </div>
  )
}

export default PermissionRow
