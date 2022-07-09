import { styled } from "@stitches/react"
import * as NavigationMenuPrimitive from "@radix-ui/react-navigation-menu"

const List = styled(NavigationMenuPrimitive.List, {
  all: "unset",
  display: "flex",
  flexDirection: "row",
  justifyContent: "center",
  alignItems: "center",
  height: "60px",
  padding: 4,
  borderRadius: 6,
  listStyle: "none",
})

export default List
