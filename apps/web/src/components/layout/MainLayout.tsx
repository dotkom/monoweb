import { type FC, type PropsWithChildren } from "react"
import Footer from "../organisms/Footer"
import { Navbar } from "../organisms/Navbar/Navbar"

const MainLayout: FC<PropsWithChildren> = ({ children }) => (
  <div className="font-poppins m-0 flex h-screen flex-col items-center justify-between p-0">
    <Navbar />
    <main className="w-full max-w-screen-xl mb-auto flex flex-col items-center ">{children}</main>
    <Footer />
  </div>
)

export default MainLayout
