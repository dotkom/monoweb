import { css, styled } from "@stitches/react"
import React, { FC } from "react"
import { keyframes } from "@stitches/react"
import * as AccordionPrimitive from "@radix-ui/react-accordion"
import { FiAlertOctagon, FiAlertTriangle, FiCheckCircle, FiInfo } from "react-icons/fi"
import { IoChevronDownOutline } from "react-icons/io5"

interface FlagProps {
  title: string
  color: string
}
interface AlertProps {
  status: "info" | "warning" | "success" | "danger"
  text: string
  showIcon?: boolean
}
interface AlertIconProps {
  status: AlertProps["status"]
}

const AlertIcon: FC<AlertIconProps> = ({ status }) => {
  switch (status) {
    case "info":
      return <FiInfo className={styles.icon({ status })} />
    case "success":
      return <FiCheckCircle className={styles.icon({ status })} />
    case "danger":
      return <FiAlertOctagon className={styles.icon({ status })} />
    case "warning":
      return <FiAlertTriangle className={styles.icon({ status })} />
  }
}
const styles = {
  icon: css({
    paddingRight: "16px",
    width: "20px",
    height: "20px",
    variants: {
      status: {
        info: {
          color: "$info3",
        },
        success: {
          color: "#ffffff",
        },
        warning: {
          color: "$orange3",
        },
        danger: {
          color: "$red3",
        },
      },
    },
  }),
}

const slideDown = keyframes({
  from: { height: 0 },
  to: { height: "var(--radix-accordion-content-height)" },
})

const slideUp = keyframes({
  from: { height: "var(--radix-accordion-content-height)" },
  to: { height: 0 },
})

const Container = styled(AccordionPrimitive.Root, {
  borderRadius: 6,
  width: 400,
  height: 136,
  backgroundColor: "transparent",
})

const Item = styled(AccordionPrimitive.Item, {
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

const Header = styled(AccordionPrimitive.Header, {
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

const Chevron = styled(IoChevronDownOutline, {
  width: "20px",
  height: "20px",
  fontWeight: 700,
  transition: "transform 300ms cubic-bezier(0.87, 0, 0.13, 1)",
  "[data-state=open] &": { transform: "rotate(180deg)" },
})

const LeftContainer = styled("div", {
  display: "flex",
  flexDirection: "row",
  justifyContent: "center",
  alignItems: "center",
})
export const FlagTrigger = React.forwardRef(({ children, ...props }, forwardedRef) => (
  <Header color="success">
    <Trigger {...props} ref={forwardedRef}>
      <LeftContainer>
        <AlertIcon status={"success"} />
        {children}
      </LeftContainer>

      <Chevron aria-hidden />
    </Trigger>
  </Header>
))
export const Content = React.forwardRef(({ children, ...props }, forwardedRef) => (
  <ContentWrapper {...props} ref={forwardedRef} color="success">
    <div>{children}</div>
    <CloseButton>Understood!</CloseButton>
  </ContentWrapper>
))

// Your app...
const Flag = (props: FlagProps) => (
  <Container color="success" type="single" defaultValue="item-1" collapsible>
    <Item value="item-1">
      <FlagTrigger color="success">{props.title}</FlagTrigger>
      <Content>Nothing to worry about, everything is going great!</Content>
    </Item>
  </Container>
)

export default Flag
