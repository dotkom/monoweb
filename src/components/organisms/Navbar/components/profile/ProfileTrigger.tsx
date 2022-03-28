import AvatarImage from "./AvatarImage";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { styled } from "@stitches/react";

export const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;

const ProfileTrigger = () => {
  return (
    <DropdownMenuTrigger asChild>
      <IconButton aria-label="Customise options">
        <AvatarImage />
      </IconButton>
    </DropdownMenuTrigger>
  );
};

const IconButton = styled("button", {
  all: "unset",
  fontFamily: "inherit",
  borderRadius: "100%",
  height: 45,
  width: 45,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "white",
});

export default ProfileTrigger;
