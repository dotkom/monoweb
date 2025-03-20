import type { Story, StoryDefault } from "@ladle/react"
import { Text } from "./Text"
import { Title } from "./Title"

export default {
  title: "Typography",
} satisfies StoryDefault

export const TypographyScale: Story = () => {
  return (
    <>
      <Title size="xl">The quick brown fox jumps over the lazy dog (title - xl)</Title>
      <Title size="lg">The quick brown fox jumps over the lazy dog (title - lg)</Title>
      <Title size="md">The quick brown fox jumps over the lazy dog (title - md)</Title>
      <Text size="lg">The quick brown fox jumps over the lazy dog (text - lg)</Text>
      <Text size="md">The quick brown fox jumps over the lazy dog (text - md)</Text>
      <Text size="sm">The quick brown fox jumps over the lazy dog (text - sm)</Text>
    </>
  )
}
