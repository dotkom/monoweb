import { styled } from "@stitches/react"
import { IoChevronDownOutline } from "react-icons/io5"
import * as AccordionPrimitive from "@radix-ui/react-accordion"
import React, { FC, ReactNode } from "react"
import { ColorlessAlertIcon } from "../Alert/ColorlessAlertIcon"
import { css } from "../../config/stitches.config"

interface IProps {
  children?: ReactNode
  color: "info" | "danger" | "warning" | "success"
}

const FlagTrigger: FC<IProps> = React.forwardRef(
  ({ children, ...props }, forwardedRef: React.ForwardedRef<HTMLButtonElement>) => (
    <AccordionPrimitive.Header className={styles.header({ color: props.color })}>
      <AccordionPrimitive.Trigger className={styles.trigger()} {...props} ref={forwardedRef}>
        <div className={styles.titleContainer()}>
          <ColorlessAlertIcon status={props.color} />
          {children}
        </div>
        <IoChevronDownOutline aria-hidden className={styles.chevron()} />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  )
)

const styles = {
  trigger: css({
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
  }),
  chevron: css({
    width: "20px",
    height: "20px",
    fontWeight: 700,
    transition: "transform 300ms cubic-bezier(0.87, 0, 0.13, 1)",
    "[data-state=open] &": { transform: "rotate(180deg)" },
  }),
  header: css({
    all: "unset",
    display: "flex",
    borderRadius: "5px",
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
  }),
  titleContainer: css({
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  }),
}

export default FlagTrigger
