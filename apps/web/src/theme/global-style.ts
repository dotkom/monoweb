import { globalCss } from "@stitches/react";

export const globalStyles = globalCss({
  body: {
    fontFamily: "$body",
    margin: 0,
    textRendering: "optimizeLegibility",
    "-webkit-font-smoothing": "antialiased",
    "-moz-osx-font-smoothing": "grayscale",
  },
});
