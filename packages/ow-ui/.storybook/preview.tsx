import { addDecorator, configure } from "@storybook/react"
import * as NextImage from "next/image"
import { globalStyles } from "../src/config/global-style"

export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
}

const Image = NextImage.default
Object.defineProperty(NextImage, "default", {
  configurable: true,
  value: (props) => <Image {...props} unoptimized />,
})

addDecorator((story) => {
  globalStyles()
  return <div>{story()}</div>
})

configure([require.context("../src/", true, /\.stories\.(tsx|mdx)$/)], module)
