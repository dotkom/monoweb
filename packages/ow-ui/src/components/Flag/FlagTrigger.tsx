import { css, styled } from "@stitches/react"
import { IoChevronDownOutline } from "react-icons/io5"
import * as AccordionPrimitive from "@radix-ui/react-accordion"
import React, { FC, ReactNode } from "react"
import { WhiteAlertIcon } from "../Alert/WhiteAlertIcon"

interface IProps {
  children?: ReactNode
  color: "info" | "danger" | "warning" | "success"
}

const FlagTrigger: FC<IProps> = React.forwardRef(
  ({ children, ...props }, forwardedRef: React.ForwardedRef<HTMLButtonElement>) => (
    <Header color={props.color}>
      <Trigger {...props} ref={forwardedRef}>
        <LeftContainer>
          <WhiteAlertIcon status={props.color} className={styles.base()} />
          {children}
        </LeftContainer>
        <Chevron aria-hidden />
      </Trigger>
    </Header>
  )
)

const Trigger = styled(AccordionPrimitive.Trigger, {
  all: "unset",
  fontFamily: "inherit",
  padding: "16px",
  height: 45,
  flex: 1,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  fontSize: 16,
  fontWeight: 600,
  lineHeight: 1,
  "&:hover": {
    cursor: "pointer",
  },
})

const Chevron = styled(IoChevronDownOutline, {
  width: "20px",
  height: "20px",
  fontWeight: 700,
  transition: "transform 300ms cubic-bezier(0.87, 0, 0.13, 1)",
  "[data-state=open] &": { transform: "rotate(180deg)" },
})

const Header = styled(AccordionPrimitive.Header, {
  all: "unset",
  display: "flex",
  borderRadius: "5px",
  borderBottomRightRadius: "0px",
  borderBottomLeftRadius: "0px",
  variants: {
    color: {
      standard: {
        backgroundColor: "$gray12",
        color: "$gray3",
      },
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

const LeftContainer = styled("div", {
  display: "flex",
  flexDirection: "row",
  justifyContent: "center",
  alignItems: "center",
})

const styles = {
  base: css({
    color: "$gray12",
  }),
}

export default FlagTrigger
