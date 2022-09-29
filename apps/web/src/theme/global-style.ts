import { globalCss } from "@dotkom/ui"

export const globalStyles = globalCss({
  html: {
    fontSize: "14px"
  },
  body: {
    fontFamily: "$body",
    margin: 0,
    textRendering: "optimizeLegibility",
    "-webkit-font-smoothing": "antialiased",
    "-moz-osx-font-smoothing": "grayscale",
  },
})
