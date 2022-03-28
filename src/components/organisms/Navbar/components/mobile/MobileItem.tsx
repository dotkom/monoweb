import { styled } from "@stitches/react";
import * as NavigationMenuPrimitive from "@radix-ui/react-navigation-menu";
import { FC } from "react";

interface MobileItemsProps {
  href: string;
}

const MobileItem: FC<MobileItemsProps> = ({ children, href }) => (
  <NavigationMenuItem>
    <MobileLink href={href}>{children}</MobileLink>
  </NavigationMenuItem>
);

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
};

const StyledLink = styled(NavigationMenuPrimitive.Link, {
  ...itemStyles,
  display: "block",
  textDecoration: "none",
  fontSize: 15,
  lineHeight: 1,
});

const NavigationMenuItem = NavigationMenuPrimitive.Item;

const MobileLink = StyledLink;

export default MobileItem;
