import OnlineIcon from "@components/atoms/OnlineIcon"
import { css } from "@dotkom/ui"
import Link from "next/link"

const NavbarLogo = () => {
  return (
    <div className={styles.container()}>
      <Link href="/">
        <a>
          {" "}
          <OnlineIcon />
        </a>
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
