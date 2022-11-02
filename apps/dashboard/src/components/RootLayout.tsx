import { FC } from "react"
import { Outlet } from "react-router-dom"

export const RootLayout: FC = () => {
  return (
    <div className="bg-blue-9">
      poop
      <Outlet />
    </div>
  )
}
