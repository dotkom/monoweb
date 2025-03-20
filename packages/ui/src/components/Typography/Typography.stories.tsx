import type { Story, StoryDefault } from "@ladle/react"
import { Link } from "./Link"
import { Text } from "./Text"
import { Title } from "./Title"

export default {
  title: "Typography",
} satisfies StoryDefault

export const TypographyScale: Story = () => {
  return (
    <div className="flex flex-col">
      <Title size="xl">The quick brown fox jumps over the lazy dog (title - xl)</Title>
      <Title size="lg">The quick brown fox jumps over the lazy dog (title - lg)</Title>
      <Title size="md">The quick brown fox jumps over the lazy dog (title - md)</Title>
      <Text size="lg">The quick brown fox jumps over the lazy dog (text - lg)</Text>
      <Link href="https://online.ntnu.no" size="lg">
        The quick brown fox jumps over the lazy dog (link - lg)
      </Link>
      <Text size="md">The quick brown fox jumps over the lazy dog (text - md)</Text>
      <Link href="https://online.ntnu.no" size="md">
        The quick brown fox jumps over the lazy dog (link - md)
      </Link>
      <Link href="https://online.ntnu.no" size="sm">
        The quick brown fox jumps over the lazy dog (link - sm)
      </Link>
      <Text size="sm">The quick brown fox jumps over the lazy dog (text - sm)</Text>
    </div>
  )
}
