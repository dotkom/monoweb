import { styled } from "@stitches/react"
import { itemStyles } from "./Link"
import * as NavigationMenuPrimitive from "@radix-ui/react-navigation-menu"

import { FC } from "react"
import { CaretDownIcon } from "@radix-ui/react-icons"
import { DesktopProps } from "./DesktopProps"

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
