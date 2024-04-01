import { type FC, type PropsWithChildren } from "react"
import Footer from "../organisms/Footer"
import { Navbar } from "../organisms/Navbar/Navbar"

const MainLayout: FC<PropsWithChildren> = ({ children }) => (
  <div className="m-0 flex h-screen flex-col items-center justify-between p-0 font-poppins">
    <Navbar /> <main className="mb-auto mt-8 w-full max-w-screen-xl px-10">{children}</main> <Footer />{" "}
  </div>
)

export default MainLayout
