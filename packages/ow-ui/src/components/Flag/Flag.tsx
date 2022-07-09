import { styled } from "@stitches/react"
import Button from "../Button"
import React from "react"
import { keyframes } from "@stitches/react"
import { ChevronDownIcon } from "@radix-ui/react-icons"
import * as AccordionPrimitive from "@radix-ui/react-accordion"

interface FlagProps {
  title: string
  color: string
}

const ButtonContainer = styled("div", {
  display: "flex",
  flexDirection: "row",
  gap: "20px",
})

const slideDown = keyframes({
  from: { height: 0 },
  to: { height: "var(--radix-accordion-content-height)" },
})

const slideUp = keyframes({
  from: { height: "var(--radix-accordion-content-height)" },
  to: { height: 0 },
})

const StyledAccordion = styled(AccordionPrimitive.Root, {
  borderRadius: 6,
  width: 400,
  height: 136,
  backgroundColor: "transparent",
})

const StyledItem = styled(AccordionPrimitive.Item, {
  overflow: "hidden",
  marginTop: 1,

  "&:first-child": {
    marginTop: 0,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },

  "&:last-child": {
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
  },

  "&:focus-within": {
    position: "relative",
    zIndex: 1,
  },
})

const StyledHeader = styled(AccordionPrimitive.Header, {
  all: "unset",
  display: "flex",
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

const StyledTrigger = styled(AccordionPrimitive.Trigger, {
  all: "unset",
  fontFamily: "inherit",
  padding: "16px",
  height: 45,
  flex: 1,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  fontSize: 14,
  lineHeight: 1,
})

const StyledContent = styled(AccordionPrimitive.Content, {
  overflow: "hidden",
  padding: "16px",
  fontSize: 15,
  '&[data-state="open"]': {
    animation: `${slideDown} 300ms cubic-bezier(0.87, 0, 0.13, 1) forwards`,
  },
  '&[data-state="closed"]': {
    animation: `${slideUp} 300ms cubic-bezier(0.87, 0, 0.13, 1) forwards`,
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

const StyledContentText = styled("div", {
  padding: "15px 20px",
})

const StyledChevron = styled(ChevronDownIcon, {
  size: "30px",
  fontWeight: 700,
  transition: "transform 300ms cubic-bezier(0.87, 0, 0.13, 1)",
  "[data-state=open] &": { transform: "rotate(180deg)" },
})

export const AccordionTrigger = React.forwardRef(({ children, ...props }, forwardedRef) => (
  <StyledHeader color="success">
    <StyledTrigger {...props} ref={forwardedRef}>
      {children}
      <StyledChevron aria-hidden />
    </StyledTrigger>
  </StyledHeader>
))
export const AccordionContent = React.forwardRef(({ children, ...props }, forwardedRef) => (
  <StyledContent {...props} ref={forwardedRef} color="success">
    <StyledContentText>{children}</StyledContentText>
    <ButtonContainer>
      <Button color="green">Understood!</Button>
      <Button color="green">No way!</Button>
    </ButtonContainer>
  </StyledContent>
))

// Your app...
const Flag = (props: FlagProps) => (
  <StyledAccordion color="success" type="single" defaultValue="item-1" collapsible>
    <StyledItem value="item-1">
      <AccordionTrigger color="success">{props.title}</AccordionTrigger>
      <AccordionContent>Nothing to worry about, everything is going great!</AccordionContent>
    </StyledItem>
  </StyledAccordion>
)

export default Flag
