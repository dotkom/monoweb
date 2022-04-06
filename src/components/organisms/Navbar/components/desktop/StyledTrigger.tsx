import { styled } from "@stitches/react";
import { itemStyles } from "./StyledLink";
import * as NavigationMenuPrimitive from "@radix-ui/react-navigation-menu";

import { FC } from "react";
import { CaretDownIcon } from "@radix-ui/react-icons";
import { DesktopProps } from "./DesktopProps";

const StyledTrigger = styled(NavigationMenuPrimitive.Trigger, {
  all: "unset",
  ...itemStyles,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 2,
});
const StyledCaret = styled(CaretDownIcon, {
  position: "relative",
  top: 1,
  "[data-state=open] &": { transform: "rotate(-180deg)" },
  "@media (prefers-reduced-motion: no-preference)": {
    transition: "transform 250ms ease",
  },
});

const StyledTriggerWithCaret: FC<DesktopProps> = ({ children, ...props }) => (
  <StyledTrigger {...props}>
    {children} <StyledCaret />
  </StyledTrigger>
);

export default StyledTriggerWithCaret;
