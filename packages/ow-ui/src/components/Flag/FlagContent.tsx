import { keyframes, styled } from "@stitches/react"
import React from "react"
import { FC, ReactNode } from "react"
import * as AccordionPrimitive from "@radix-ui/react-accordion"

interface IProps {
  children?: ReactNode
  color?: string
}

const Content: FC<IProps> = React.forwardRef(
  ({ children, ...props }, forwardedRef: React.ForwardedRef<HTMLDivElement>) => (
    <ContentWrapper {...props} ref={forwardedRef} color="success">
      <div>{children}</div>
      <CloseButton>Understood!</CloseButton>
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
  fontSize: 16,
  '&[data-state="open"]': {
    animation: `${slideDown} 350ms cubic-bezier(0.87, 0, 0.13, 1) forwards`,
  },
  '&[data-state="closed"]': {
    animation: `${slideUp} 350ms cubic-bezier(0.87, 0, 0.13, 1) forwards`,
  },
  variants: {
    color: {
      standard: {
        backgroundColor: "$gray12",
        color: "$gray3",
      },
      info: {
        backgroundColor: "$blue3",
        color: "$gray12",
      },
      error: {
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
  },
  "&:active": {
    transform: "translateY(2px)",
  },
  color: "$gray12",
})

export default Content
