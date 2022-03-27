import { styled } from "@stitches/react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";

const StyledAvatar = styled(AvatarPrimitive.Root, {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  verticalAlign: "middle",
  overflow: "hidden",
  userSelect: "none",
  width: 40,
  height: 40,
  borderRadius: "100%",
  transition: "all 0.5s",
  "&:hover": {
    transform: "scale(1.1)",
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
  backgroundColor: "$blue3",
  "&:hover": {
    backgroundColor: "$blue5",
  },
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
    <AvatarFallback delayMs={500}>CT</AvatarFallback>
  </MenuAvatar>
);

export default MainAvatar;
