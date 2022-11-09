import { CaretDownIcon } from "@radix-ui/react-icons"
import * as NavigationMenuPrimitive from "@radix-ui/react-navigation-menu"
import { styled } from "@stitches/react"
import { FC } from "react"

import { DesktopProps } from "./DesktopProps"
import { itemStyles } from "./Link"

const Trigger = styled(NavigationMenuPrimitive.Trigger, {
  all: "unset",
  ...itemStyles,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 2,
})
const Caret = styled(CaretDownIcon, {
  position: "relative",
  top: 1,
  "[data-state=open] &": { transform: "rotate(-180deg)" },
  "@media (prefers-reduced-motion: no-preference)": {
    transition: "transform 250ms ease",
  },
})

const TriggerWithCaret: FC<DesktopProps> = ({ children, ...props }) => (
  <Trigger {...props}>
    {children} <Caret />
  </Trigger>
)

export default TriggerWithCaret
