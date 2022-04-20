import { css, styled } from "@stitches/react";
import * as NavigationMenuPrimitive from "@radix-ui/react-navigation-menu";
import { fadeIn, fadeOut } from "../../keyframes/keyframes";

const IndicatorWithArrow = () => (
  <StyledIndicator>
    <div className={styles.arrow()} />
  </StyledIndicator>
);

const styles = {
  indicator: css({
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "center",
    height: 10,
    top: "100%",
    overflow: "hidden",
    zIndex: 1,
    fill: "white",
    "@media (prefers-reduced-motion: no-preference)": {
      transition: "width, transform 250ms ease",
      '&[data-state="visible"]': { animation: `${fadeIn} 200ms ease` },
      '&[data-state="hidden"]': { animation: `${fadeOut} 200ms ease` },
    },
  }),
  arrow: css({
    position: "relative",
    top: "70%",
    backgroundColor: "white",
    width: 10,
    height: 10,
    transform: "rotate(45deg)",
    borderTopLeftRadius: 2,
  }),
};

const StyledIndicator = styled(NavigationMenuPrimitive.Indicator, styles.indicator);

export default IndicatorWithArrow;
