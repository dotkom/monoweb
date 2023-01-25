import * as React from "react"
import { AccordionContainer, AccordionContent, AccordionItem, AccordionTrigger } from "./AccordionComponents"

export interface AccordionItem {
  title: string
  content: string
}

interface AccordionProps {
  items: AccordionItem[]
}

export const Accordion: React.FC<AccordionProps> = ({ items }) => {
  return (
    <AccordionContainer type="single" collapsible className="w-[450px]">
      {items.map((item) => (
        <AccordionItem value={`item-${item.title}`}>
          <AccordionTrigger>{item.title}</AccordionTrigger>
          <AccordionContent>{item.content}</AccordionContent>
        </AccordionItem>
      ))}
    </AccordionContainer>
  )
}
