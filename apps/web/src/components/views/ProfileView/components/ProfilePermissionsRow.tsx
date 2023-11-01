import { FC, ReactNode } from "react"
import PermissionOption from "./ProfilePermissionsOption"

interface PermissionProps {
  children: ReactNode
}

const PermissionRow: FC<PermissionProps> = ({ children }) => {
  return (
    <div className="w-full">
      <div className="col-span-4 mt-1">{children}</div>
      <PermissionOption />
      <PermissionOption />
    </div>
  )
}

export default PermissionRow
