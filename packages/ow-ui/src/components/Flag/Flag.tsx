import { styled } from "@stitches/react"
import * as AccordionPrimitive from "@radix-ui/react-accordion"
import FlagTrigger from "./FlagTrigger"
import Content from "./FlagContent"

export interface FlagProps {
  title: string
  color: string
}

const Flag = (props: FlagProps) => (
  <Container color="success" type="single" defaultValue="item-1" collapsible>
    <Item value="item-1">
      <FlagTrigger color="success">{props.title}</FlagTrigger>
      <Content>Nothing to worry about, everything is going great!</Content>
    </Item>
  </Container>
)

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

  "&:focus-within": {
    position: "relative",
    zIndex: 1,
  },
})

export default Flag
