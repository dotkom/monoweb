import React from "react"
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu"

import NavbarLogo from "./components/logo"
import Content from "./components/mobile/Content"
import { createStyles } from "@theme"
import ContentTrigger from "./components/mobile/ContentTrigger"

const DropdownMenu = DropdownMenuPrimitive.Root

export const MobileDropdown = () => (
  <div className={styles.container()}>
    <div className={styles.logoContainer()}>
      <NavbarLogo />
    </div>
    <div className={styles.wrapper()}>
      <DropdownMenu>
        <ContentTrigger />
        <Content />
      </DropdownMenu>
    </div>
  </div>
)

const styles = createStyles({
  container: {
    display: "none",
    width: "100%",
    "@media only screen and (max-width: 900px)": {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
    },
  },
  logoContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
    marginLeft: "30px",
  },
  wrapper: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
  },
})

export default MobileDropdown
