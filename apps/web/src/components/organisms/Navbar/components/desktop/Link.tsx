import * as NavigationMenuPrimitive from "@radix-ui/react-navigation-menu"
import { styled } from "@stitches/react"

export const itemStyles = {
  padding: "8px 12px",
  outline: "none",
  userSelect: "none",
  fontWeight: 600,
  lineHeight: 1,
  borderRadius: 4,
  fontSize: 15,
  color: "#000",
  "&:focus": { position: "relative" },
  "&:hover": { color: "#959595" },
}

const Link = styled(NavigationMenuPrimitive.Link, {
  ...itemStyles,
  display: "block",
  textDecoration: "none",
  fontSize: 15,
  lineHeight: 1,
})
export default Link
