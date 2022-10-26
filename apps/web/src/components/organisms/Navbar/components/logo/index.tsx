import OnlineIcon from "@components/atoms/OnlineIcon"
import { css } from "@dotkomonline/ui"
import Link from "next/link"

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
