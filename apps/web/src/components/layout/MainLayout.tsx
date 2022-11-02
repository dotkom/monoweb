import { css } from "@dotkomonline/ui"
import { FC, PropsWithChildren } from "react"

import Footer from "../organisms/Footer"
import Navbar from "../organisms/Navbar"

const MainLayout: FC<PropsWithChildren> = ({ children }) => {
  return (
    <div className={styles.root()}>
      <Navbar />
      <main className={styles.content()}>{children}</main>
      <Footer />
    </div>
  )
}

const styles = {
  root: css({
    padding: 0,
    margin: 0,
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    justifyContent: "space-between",
    alignItems: "center",
  }),
  content: css({
    maxWidth: "$sizes$lg",
    width: "100%",
    marginBottom: "auto",
  }),
}

export default MainLayout
