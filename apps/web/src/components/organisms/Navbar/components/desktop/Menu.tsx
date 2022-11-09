import * as NavigationMenuPrimitive from "@radix-ui/react-navigation-menu"
import { styled } from "@stitches/react"

const Menu = styled(NavigationMenuPrimitive.Root, {
  position: "relative",
  display: "flex",
  justifyContent: "center",
  zIndex: 1,
})

export default Menu
