import * as NextImage from "next/image"

import "../../web/src/styles/globals.css"

export const parameters = {
  darkMode: {
    current: "dark",
  },
}

const Image = NextImage.default
Object.defineProperty(NextImage, "default", {
  configurable: true,
  value: (props) => <Image {...props} unoptimized />,
})

export const decorators = [
  (Story) => {
    return <Story />
  },
]
