import { themes } from "@storybook/theming"

import "tailwindcss/tailwind.css"
import "@dotkomonline/ui/tailwind.css"

export const parameters = {
  darkMode: {
    current: "dark",
  },
  backgrounds: {
    default: "black",
    values: [{ name: "black", value: "#000212" }],
  },
  docs: {
    theme: {...themes.dark, fontBase:'"Poppins"'},
  },
}

export const decorators = [
  (Story) => {
    return <div className="dark" data-theme="dark"><Story /></div>
  },
]
