import { styled } from "@stitches/react"
import { scaleIn, scaleOut } from "../../keyframes/keyframes"
import * as NavigationMenuPrimitive from "@radix-ui/react-navigation-menu"
import { css } from "@dotkom/ui"

const NavigationMenuViewport = () => (
  <div className={styles.wrapper()}>
    <StyledViewport />
  </div>
)

const styles = {
  wrapper: css({
    position: "absolute",
    display: "flex",
    justifyContent: "center",
    width: "100%",
    top: "100%",
    left: 0,
    perspective: "2000px",
  }),
  viewport: css({
    position: "relative",
    transformOrigin: "top center",
    marginTop: 10,
    width: "100%",
    backgroundColor: "white",
    borderRadius: 6,
    overflow: "hidden",
    boxShadow: "hsl(206 22% 7% / 35%) 0px 10px 38px -10px, hsl(206 22% 7% / 20%) 0px 10px 20px -15px",
    height: "var(--radix-navigation-menu-viewport-height)",

    "@media only screen and (min-width: 600px)": {
      width: "var(--radix-navigation-menu-viewport-width)",
    },
    "@media (prefers-reduced-motion: no-preference)": {
      transition: "width, height, 300ms ease",
      '&[data-state="open"]': { animation: `${scaleIn} 200ms ease` },
      '&[data-state="closed"]': { animation: `${scaleOut} 200ms ease` },
    },
  }),
}

const StyledViewport = styled(NavigationMenuPrimitive.Viewport, styles.viewport)

export default NavigationMenuViewport
