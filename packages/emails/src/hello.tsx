import React from "react"
import TailwindConfig from "@dotkomonline/config/tailwind-preset"
import { Html } from "@react-email/html"
import { Container } from "@react-email/container"
import { Heading } from "@react-email/heading"
import { Text } from "@react-email/text"
import { Tailwind, TailwindProps } from "@react-email/tailwind"
import { z } from "zod"
import { createTemplate } from "./template"

const input = z.object({
  name: z.string(),
})

export const HelloEmailTemplate = createTemplate(input)({
  key: "hello-world",
  render: ({ name }) => (
    <Html>
      <Tailwind config={TailwindConfig as TailwindProps["config"]}>
        <Container>
          <Heading>Hello world</Heading>
          <Text className="text-amber-12 text-4xl">This is a special message especially for you {name}!</Text>
        </Container>
      </Tailwind>
    </Html>
  ),
})
