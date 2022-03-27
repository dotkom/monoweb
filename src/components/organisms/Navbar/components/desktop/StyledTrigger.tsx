import { styled } from "@stitches/react";
import { itemStyles } from "./StyledLink";
import * as NavigationMenuPrimitive from "@radix-ui/react-navigation-menu";
import { DesktopProps } from "../../DesktopNavigation";
import { FC } from "react";

const StyledTrigger = styled(NavigationMenuPrimitive.Trigger, {
  all: "unset",
  ...itemStyles,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 2,
});

const StyledTriggerWithCaret: FC<DesktopProps> = ({ children, ...props }) => (
  <StyledTrigger {...props}>{children}</StyledTrigger>
);

export default StyledTriggerWithCaret;
