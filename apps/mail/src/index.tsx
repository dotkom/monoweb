import { Html } from "@react-email/html"
import { Button } from "@react-email/button"
import { FC } from "react"

interface EmailProps {
  url: string
}

export const Email: FC<EmailProps> = ({ url }) => {
  return (
    <Html lang="en">
      <Button href={url}>Click me</Button>
    </Html>
  )
}
