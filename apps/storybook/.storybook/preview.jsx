import { themes } from "@storybook/theming"
import * as NextImage from "next/image"

import "../../web/src/styles/globals.css"

const OriginalNextImage = NextImage.default

NextImage.default = (props) =>
  typeof props.src === "string" ? (
    <OriginalNextImage {...props} unoptimized blurDataURL={props.src} />
  ) : (
    <OriginalNextImage {...props} unoptimized />
  )

NextImage.__esModule = true

export const parameters = {
  darkMode: {
    current: "dark",
  },
  backgrounds: {
    default: "black",
    values: [{ name: "black", value: "#000212" }],
  },
  docs: {
    theme: themes.dark,
  },
}

export const decorators = [
  (Story) => {
    return <Story />
  },
]
