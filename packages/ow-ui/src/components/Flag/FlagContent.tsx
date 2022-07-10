import { keyframes, styled } from "@stitches/react"
import React from "react"
import { FC, ReactNode } from "react"
import * as AccordionPrimitive from "@radix-ui/react-accordion"

interface IProps {
  children?: ReactNode
  color?: "info" | "danger" | "warning" | "success"
}

const Content: FC<IProps> = React.forwardRef(
  ({ children, ...props }, forwardedRef: React.ForwardedRef<HTMLDivElement>) => (
    <ContentWrapper {...props} ref={forwardedRef} color={props.color}>
      <div>{children}</div>
      <CloseButton color={props.color}>Understood!</CloseButton>
    </ContentWrapper>
  )
)

const slideDown = keyframes({
  from: { height: 0 },
  to: { height: "var(--radix-accordion-content-height)" },
})

const slideUp = keyframes({
  from: { height: "var(--radix-accordion-content-height)" },
  to: { height: 0 },
})

const ContentWrapper = styled(AccordionPrimitive.Content, {
  overflow: "hidden",
  paddingLeft: "52px",
  paddingRight: "52px",
  borderRadius: "5px",
  borderTopLeftRadius: "0px",
  borderTopRightRadius: "0px",

  fontSize: 16,
  '&[data-state="open"]': {
    animation: `${slideDown} 350ms cubic-bezier(0.87, 0, 0.13, 1) forwards`,
  },
  '&[data-state="closed"]': {
    animation: `${slideUp} 350ms cubic-bezier(0.87, 0, 0.13, 1) forwards`,
  },
  variants: {
    color: {
      info: {
        backgroundColor: "$info3",
        color: "$gray12",
      },
      danger: {
        backgroundColor: "$red3",
        color: "$gray12",
      },
      warning: {
        backgroundColor: "$orange3",
        color: "$gray1",
      },
      success: {
        backgroundColor: "$green3",
        color: "$gray12",
      },
    },
  },
})

const CloseButton = styled("button", {
  width: "106px",
  height: "24px",
  backgroundColor: "rgba(255, 255, 255, 0.25)",
  border: "none",
  marginTop: "10px",
  marginBottom: "16px",
  borderRadius: "3px",
  fontSize: "16px",
  "&:hover": {
    transform: "translateY(-1px)",
    cursor: "pointer",
  },
  "&:active": {
    transform: "translateY(2px)",
  },
  variants: {
    color: {
      info: {
        color: "$gray12",
      },
      danger: {
        color: "$gray12",
      },
      warning: {
        color: "$gray1",
        backgroundColor: "#ECB605",
      },
      success: {
        color: "$gray12",
      },
    },
  },
})

export default Content
