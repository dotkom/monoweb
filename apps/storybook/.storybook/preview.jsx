import "../../web/src/styles/globals.css"
import { themes } from "@storybook/theming"

export const parameters = {
  darkMode: {
    current: "dark",
  },
  backgrounds: {
    default: "black",
    values: [{name: "black", value: "#000212"}]
  },
  docs: {
    theme: themes.dark,
  }
}


export const decorators = [
  (Story) => {
    return <Story />
  },
]
