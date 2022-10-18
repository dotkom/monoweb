import { css } from "@dotkom/ui"
import React, { FC } from "react"
import Navbar from "../organisms/Navbar"

const MainLayout: FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className={styles.root()}>
      <Navbar />
      <main className={styles.content()}>{children}</main>
    </div>
  )
}

const styles = {
  root: css({
    padding: 0,
    margin: 0,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  }),
  content: css({
    maxWidth: "$sizes$lg",
    width: "100%",
  }),
}

export default MainLayout
