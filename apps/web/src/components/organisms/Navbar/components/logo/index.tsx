import { css } from "@dotkomonline/ui"
import Link from "next/link"

import OnlineIcon from "@components/atoms/OnlineIcon"

const NavbarLogo = () => {
  return (
    <div className={styles.container()}>
      <Link href="/">
        <OnlineIcon />
      </Link>
    </div>
  )
}

const styles = {
  container: css({
    width: "100px",
    height: "45px",
  }),
}

export default NavbarLogo
