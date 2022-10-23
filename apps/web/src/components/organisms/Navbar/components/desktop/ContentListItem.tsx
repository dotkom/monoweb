import { mauve, violet } from "@radix-ui/colors"
import { css, styled } from "@dotkomonline/ui"
import { FC } from "react"
import { NavigationMenuLink } from "."
import { DesktopProps } from "./DesktopProps"

const ContentListItem: FC<DesktopProps> = ({ children, title, ...props }) => (
  <li>
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
  </li>
)

const title = css({
  fontWeight: 500,
  lineHeight: 1.2,
  marginBottom: 5,
  color: violet.violet12,
})

const text = css({
  all: "unset",
  color: mauve.mauve11,
  lineHeight: 1.4,
  fontWeight: "initial",
})
export const LinkTitle = styled("div", title)

export const LinkText = styled("p", text)

export default ContentListItem
