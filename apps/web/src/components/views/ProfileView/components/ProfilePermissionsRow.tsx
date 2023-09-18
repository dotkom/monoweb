import { FC, ReactNode, useState, useEffect } from "react"
import PermissionOption from "./ProfilePermissionsOption"

interface PermissionProps {
  children: ReactNode
}

const PermissionRow: FC<PermissionProps> = ({ children }) => {
  const [isChecked] = useState<boolean>(false)

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
