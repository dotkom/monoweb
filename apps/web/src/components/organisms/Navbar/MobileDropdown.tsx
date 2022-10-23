import React from "react"
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu"
import NavbarLogo from "./components/logo"
import Content from "./components/mobile/Content"
import ContentTrigger from "./components/mobile/ContentTrigger"
import { css } from "@dotkomonline/ui"

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

const styles = {
  container: css({
    display: "none",
    width: "100%",
    "@media only screen and (max-width: 900px)": {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
    },
  }),
  logoContainer: css({
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
    marginLeft: "30px",
  }),
  wrapper: css({
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
  }),
}

export default MobileDropdown
