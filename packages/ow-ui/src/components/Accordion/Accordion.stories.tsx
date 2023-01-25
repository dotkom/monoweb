import { ComponentStory } from "@storybook/react"
import React from "react"
import { Accordion, AccordionItem } from "./Accordion"

export default {
  title: "atoms/Accordion",
  component: Accordion,
}

const items: AccordionItem[] = [
  { title: "Is it accessible?", content: "Yes. It adheres to the WAI-ARIA design pattern." },
  {
    title: "Is it styled?",
    content: "Yes. It comes with default styles that matches the other components aesthetic.",
  },
  { title: "Is it animated?", content: "Yes. It's animated by default, but you can disable it if you prefer." },
]

const Template: ComponentStory<typeof Accordion> = (args) => (
  <div className="max-w-[400px]">
    <Accordion items={items} />
  </div>
)

export const Example = Template.bind({})
