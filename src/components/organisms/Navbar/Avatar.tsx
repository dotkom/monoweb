import * as Avatar from "@radix-ui/react-avatar";
import { styled } from "@stitches/react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Box } from "@components/primitives";

const StyledAvatar = styled(AvatarPrimitive.Root, {
  filter: "grayscale()",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  verticalAlign: "middle",
  overflow: "hidden",
  userSelect: "none",
  width: 45,
  height: 45,
  borderRadius: "100%",
  backgroundColor: "#FFC0CB",
  transition: "filter 0.4s ease-in-out",
  "&:hover": {
    filter: "none",
  },
});

const StyledImage = styled(AvatarPrimitive.Image, {
  width: "100%",
  height: "100%",
  objectFit: "cover",
  borderRadius: "inherit",
});

const StyledFallback = styled(AvatarPrimitive.Fallback, {
  width: "100%",
  height: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "#",
  color: "white",
  fontSize: 15,
  lineHeight: 1,
  fontWeight: 500,
});

const MenuAvatar = StyledAvatar;
const AvatarImage = StyledImage;
const AvatarFallback = StyledFallback;

const MainAvatar = () => (
  <MenuAvatar>
    <AvatarImage alt="Colm Tuite" />
    <AvatarFallback delayMs={600}>CT</AvatarFallback>
  </MenuAvatar>
);

export default MainAvatar;
