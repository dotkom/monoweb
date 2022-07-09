import OnlineIcon from "@components/atoms/OnlineIcon"
import Link from "next/link"
import { createStyles } from "@theme"

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

const styles = createStyles({
  container: {
    width: "100px",
    height: "45px",
  },
})

export default NavbarLogo
