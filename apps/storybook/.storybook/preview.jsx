import { themes } from "@storybook/theming"
import * as nextImage from "next/image"

import "../../web/src/styles/globals.css"

Object.defineProperty(nextImage, "default", {
  configurable: true,
  value: (props) => <img {...props} />,
})

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
