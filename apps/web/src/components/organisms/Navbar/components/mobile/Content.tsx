import { css } from "@dotkomonline/ui"
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu"
import { styled } from "@stitches/react"

import { slideDownAndFade, slideLeftAndFade, slideRightAndFade, slideUpAndFade } from "../../keyframes/keyframes"

const Content = () => {
  return (
    <Container sideOffset={5}>
      <Item>Profil</Item>
      <Item>Dashboard</Item>
      <Item>Adminpanel</Item>

      <Separator />
      <Label>For studenter</Label>

      <Item>Webshop</Item>
      <Item>Wiki</Item>
      <Item>Offline</Item>
      <Item>Artikler</Item>

      <Separator />
      <Label>Om oss</Label>
      <Item>Interessegrupper</Item>
      <Item>Om online</Item>
      <Separator />

      <Item>For bedrifter</Item>
      <Item>Karriere</Item>
      <Separator />
      <Item className={styles.danger()}>Logg ut</Item>
    </Container>
  )
}

const styles = {
  container: css({
    minWidth: 300,
    backgroundColor: "white",
    borderRadius: 6,
    padding: 5,
    boxShadow: "0px 10px 38px -10px rgba(22, 23, 24, 0.35), 0px 10px 20px -15px rgba(22, 23, 24, 0.2)",
    "@media (prefers-reduced-motion: no-preference)": {
      animationDuration: "400ms",
      animationTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
      animationFillMode: "forwards",
      willChange: "transform, opacity",
      '&[data-state="open"]': {
        '&[data-side="top"]': { animationName: slideDownAndFade },
        '&[data-side="right"]': { animationName: slideLeftAndFade },
        '&[data-side="bottom"]': { animationName: slideUpAndFade },
        '&[data-side="left"]': { animationName: slideRightAndFade },
      },
    },
  }),
  danger: css({
    color: "$red3",
    fontWeight: 600,
    "&:hover": {
      color: "$red9",
    },
  }),
  item: css({
    all: "unset",
    fontSize: 16,
    lineHeight: 1,
    color: "#000",
    borderRadius: 3,
    display: "flex",
    alignItems: "center",
    height: 25,
    padding: "5px",
    position: "relative",
    paddingLeft: 25,
    userSelect: "none",
    cursor: "pointer",

    "&[data-disabled]": {
      color: "$gray6",
      pointerEvents: "none",
    },

    "&:focus": {
      color: "$gray9",
    },
    variants: {
      layout: {
        one: {
          color: "&red3",
        },
      },
    },
  }),
  label: css({
    paddingLeft: 25,
    fontSize: 12,
    lineHeight: "25px",
    color: "$gray2",
  }),
  separator: css({
    height: 1,
    backgroundColor: "$gray11",
    margin: 5,
  }),
}

const Item = styled(DropdownMenuPrimitive.Item, styles.item)
const Separator = styled(DropdownMenuPrimitive.Separator, styles.separator)
const Container = styled(DropdownMenuPrimitive.Content, styles.container)
const Label = styled(DropdownMenuPrimitive.Label, styles.label)

export default Content
