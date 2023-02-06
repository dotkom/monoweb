import { FC, PropsWithChildren } from "react"

import Footer from "../organisms/Footer"
import { Navbar } from "../organisms/Navbar/Navbar"

const MainLayout: FC<PropsWithChildren> = ({ children }) => {
  return (
    <div className="m-0 flex h-screen flex-col items-center justify-between bg-white p-0 dark:bg-[#131620]">
      <Navbar />
      <main className="w-100 mb-auto mt-20 max-w-screen-lg">{children}</main>
      <Footer />
    </div>
  )
}

export default MainLayout
