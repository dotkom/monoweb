import { type FC, type PropsWithChildren } from "react"
import Footer from "../organisms/Footer"
import { Navbar } from "../organisms/Navbar/Navbar"

const MainLayout: FC<PropsWithChildren> = ({ children }) => (
  <div className="font-poppins m-0 flex h-screen flex-col items-center justify-between p-0">
    <Navbar />
    <main className="mb-auto w-full">{children}</main>
    <Footer />{" "}
  </div>
)

export default MainLayout
