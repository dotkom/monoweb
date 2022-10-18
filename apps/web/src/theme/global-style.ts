import { globalCss } from "@dotkom/ui"

export const globalStyles = globalCss({
  html: {
    fontSize: "14px",
  },
  "html, body, #__next": {
    width: "100%",
    height: "100%"
  },
  body: {
    fontFamily: "$body",
    margin: 0,
    textRendering: "optimizeLegibility",
    "-webkit-font-smoothing": "antialiased",
    "-moz-osx-font-smoothing": "grayscale",
  },
})
