import { css } from "@dotkomonline/ui"
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu"
import { styled } from "@stitches/react"
import { useRouter } from "next/router"

import DropdownItemsContainer from "./DropdownItemContainer"
import ProfileTrigger from "./ProfileTrigger"

export const Profile = () => {
  const router = useRouter()

  return (
    <DropdownMenu>
      <ProfileTrigger />
      <DropdownItemsContainer sideOffset={5}>
        <DropdownMenuItem onSelect={() => router.push("/profile")}>Profil</DropdownMenuItem>
        <DropdownMenuItem>Saldo</DropdownMenuItem>
        <DropdownMenuItem disabled>Dashboard</DropdownMenuItem>
        <DropdownMenuItem disabled>Adminpanel</DropdownMenuItem>
        <DropdownMenuItem>Kontakt oss</DropdownMenuItem>
        <DropdownMenuItem>Logg ut</DropdownMenuItem>

        <DropdownMenuArrow />
      </DropdownItemsContainer>
    </DropdownMenu>
  )
}

const styles = {
  items: css({
    all: "unset",
    fontSize: 15,
    lineHeight: 1,
    color: "#153E75",
    borderRadius: 3,
    display: "flex",
    alignItems: "center",
    height: 40,
    padding: "0 5px",
    position: "relative",
    paddingLeft: 25,
    userSelect: "none",

    "&[data-disabled]": {
      color: "#707888",
      pointerEvents: "none",
    },

    "&:focus": {
      backgroundColor: "#A1B2C8",
      color: "#0D2546",
    },
  }),
  arrow: css({
    fill: "white",
  }),
}

const DropdownMenuArrow = styled(DropdownMenuPrimitive.Arrow, styles.arrow)
const DropdownMenuItem = styled(DropdownMenuPrimitive.Item, styles.items)

//Radix components
export const DropdownMenu = DropdownMenuPrimitive.Root

export default Profile
