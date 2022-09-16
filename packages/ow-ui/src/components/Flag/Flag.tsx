import { css } from "@stitches/react"
import * as AccordionPrimitive from "@radix-ui/react-accordion"
import FlagTrigger from "./Trigger"
import Content from "./Content"
import { FC, ReactNode } from "react"

export interface FlagProps {
  title: string
  color: "info" | "danger" | "warning" | "success"
  children: ReactNode
}

const Flag: FC<FlagProps> = ({ title, color, children }) => (
  <AccordionPrimitive.Root className={styles.container()} type="single" defaultValue="item-1" collapsible>
    <AccordionPrimitive.Item className={styles.item()} value="item-1">
      <FlagTrigger color={color}>{title}</FlagTrigger>
      <Content color={color}>{children}</Content>
    </AccordionPrimitive.Item>
  </AccordionPrimitive.Root>
)

const styles = {
  container: css({
    borderRadius: 6,
    width: 400,
    height: 136,
    backgroundColor: "transparent",
  }),
  item: css({
    overflow: "hidden",
    marginTop: 1,

    "&:first-child": {
      marginTop: 0,
      borderTopLeftRadius: 4,
      borderTopRightRadius: 4,
    },

    "&:focus-within": {
      position: "relative",
      zIndex: 1,
    },
  }),
}

export default Flag
