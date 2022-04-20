import { styled } from "@stitches/react"
import { slideDownAndFade, slideLeftAndFade, slideRightAndFade, slideUpAndFade } from "../../keyframes/keyframes"
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu"
import { css } from "@theme"

const styles = {
  content: css({
    minWidth: 220,
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
}

const DropdownItemsContainer = styled(DropdownMenuPrimitive.Content, styles.content)

export default DropdownItemsContainer
