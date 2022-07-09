import { globalStyles } from "../../../packages/ow-ui/src/config/global-style"

export const decorators = [
  (Story) => {
    globalStyles()
    return <Story />
  },
]
