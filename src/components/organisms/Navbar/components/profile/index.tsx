import React from "react";
import { styled } from "@stitches/react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import DropdownItemsContainer from "./DropdownItemContainer";
import ProfileTrigger from "./ProfileTrigger";

export const Profile = () => {
  return (
    <DropdownMenu>
      <ProfileTrigger />
      <DropdownItemsContainer sideOffset={5}>
        <DropdownMenuItem>Profil</DropdownMenuItem>
        <DropdownMenuItem>Saldo</DropdownMenuItem>
        <DropdownMenuItem disabled>Dashboard</DropdownMenuItem>
        <DropdownMenuItem disabled>Adminpanel</DropdownMenuItem>
        <DropdownMenuItem>Kontakt oss</DropdownMenuItem>
        <DropdownMenuItem>Log ut</DropdownMenuItem>

        <DropdownMenuArrow />
      </DropdownItemsContainer>
    </DropdownMenu>
  );
};

const itemStyles = {
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
};

const StyledArrow = styled(DropdownMenuPrimitive.Arrow, {
  fill: "white",
});
const StyledItem = styled(DropdownMenuPrimitive.Item, { ...itemStyles });

//Radix components
export const DropdownMenu = DropdownMenuPrimitive.Root;

//Styled radix components
const DropdownMenuItem = StyledItem;
const DropdownMenuArrow = StyledArrow;

export default Profile;
