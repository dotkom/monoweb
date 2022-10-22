import DesktopNavigation from "@components/organisms/Navbar/DesktopNavigation"
import MobileDropdown from "./MobileDropdown"
import { styled, css } from "@dotkom/ui"
import useWindow from "./useWindow"

const Navbar = () => {
  const [color, shadow] = useWindow()
  return (
    <Container css={{ boxShadow: shadow, backgroundColor: color }}>
      <DesktopNavigation />
      <MobileDropdown />
    </Container>
  )
}

const styles = {
  container: css({
    height: "70px",
    width: "100vw",
    display: "flex",
    zIndex: 100,
    marginBottom: "70px",
    transition: "background-color 200ms linear",
    margin: 0,
    padding: 0,
    backdropFilter: "blur(8px)",
  }),
}

const Container = styled("div", styles.container)

export default Navbar
