import { FC } from "react"
import { Outlet } from "react-router-dom"

import { Sidebar } from "./Sidebar"

export const RootLayout: FC = () => {
  return (
    <div className="bg-background flex">
      <Sidebar />
      <main>
        <Outlet />
      </main>
    </div>
  )
}
