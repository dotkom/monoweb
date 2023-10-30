import { Body, Column, Container, Head, Heading, Html, Preview, Row, Text } from "@react-email/components"
import { Tailwind } from "@react-email/tailwind"
import { z } from "zod"
import { createTemplate, TemplateProps } from "../template"

const Props = z.object({
  username: z.string().nonempty(),
})

export default function HelloWorldEmail({ username = "Ola Nordmann" }: TemplateProps<typeof Props>) {
  return (
    <Html>
      <Head />
      <Preview>This is an example email</Preview>
      <Tailwind>
        <Body className="bg-white">
          <Container>
            <Heading as="h1">Hello world</Heading>
            <Text>Nice to meet you {username}.</Text>
            <Row>
              <Column>A</Column>
              <Column>B</Column>
              <Column>C</Column>
            </Row>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}

export const Template = createTemplate("hello-world", Props, HelloWorldEmail)
