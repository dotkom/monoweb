import { mauve, violet } from "@radix-ui/colors";
import { styled } from "@stitches/react";
import { FC } from "react";
import { NavigationMenuLink } from ".";
import { DesktopProps } from "./DesktopProps";

export const ListItem = styled("li", {});

export const LinkTitle = styled("div", {
  fontWeight: 500,
  lineHeight: 1.2,
  marginBottom: 5,
  color: violet.violet12,
});

export const LinkText = styled("p", {
  all: "unset",
  color: mauve.mauve11,
  lineHeight: 1.4,
  fontWeight: "initial",
});

const ContentListItem: FC<DesktopProps> = ({ children, title, ...props }) => (
  <ListItem>
    <NavigationMenuLink
      {...props}
      css={{
        padding: 12,
        borderRadius: 6,
        "&:hover": { backgroundColor: mauve.mauve3 },
      }}
    >
      <LinkTitle>{title}</LinkTitle>
      <LinkText>{children}</LinkText>
    </NavigationMenuLink>
  </ListItem>
);

export default ContentListItem;
