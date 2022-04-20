import { utils } from "./utils"
import * as Stitches from "@stitches/react"

export const { styled, getCssText, css, globalCss, keyframes, prefix, reset, theme, config } = Stitches.createStitches({
  theme: {
    colors: {
      blue1: "#0D2546",
      blue2: "#11325E",
      blue3: "#153E75",
      blue4: "#2C5183",
      blue5: "#446591",
      blue6: "#5B789E",
      blue7: "#738BAC",
      blue8: "#8A9FBA",
      blue9: "#A1B2C8",
      blue10: "#B9C5D6",
      blue11: "#D0D8E3",
      blue12: "#E8ECF1",
      bluebg: "#EBF3FE",
      orange1: "#966E35",
      orange2: "#C89247",
      orange3: "#FAB759",
      orange4: "#FBBE6A",
      orange5: "#FBC57A",
      orange6: "#FCCD8B",
      orange7: "#FCD49B",
      orange8: "#FDDBAC",
      orange9: "#FDE2BD",
      orange10: "#FEE9CD",
      orange11: "#FEF1DE",
      orange12: "#FFF8EE",
      red1: "#811722",
      red2: "#AC1E2D",
      red3: "#D72638",
      red4: "#DB3C4C",
      red5: "#DF5160",
      red6: "#E36774",
      red7: "#E77D88",
      red8: "#EB939C",
      red9: "#EFA8AF",
      red10: "#F3BEC3",
      red11: "#F7D4D7",
      red12: "#FBE9EB",
      green1: "#425845",
      green2: "#698C6E",
      green3: "#83AF89",
      green4: "#8FB795",
      green5: "#9CBFA1",
      green6: "#A8C7AC",
      green7: "#B5CFB8",
      green8: "#C1D7C4",
      green9: "#CDDFD0",
      green10: "#DAE7DC",
      green11: "#E6EFE7",
      green12: "#F3F7F3",
      gray1: "#2E3440",
      gray2: "#3D4555",
      gray3: "#4C566A",
      gray4: "#5E6779",
      gray5: "#707888",
      gray6: "#828997",
      gray7: "#949AA6",
      gray8: "#A6ABB5",
      gray9: "#B7BBC3",
      gray10: "#C9CCD2",
      gray11: "#DBDDE1",
      gray12: "#EDEEF0",
      white: "#fff",
      black: "#000",
    },
    fonts: {
      body: 'Poppins,system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
      monospace: "Menlo, monospace",
    },
    fontSizes: {
      xs: "0.75rem",
      sm: "0.875rem",
      md: "1rem",
      lg: "1.125rem",
      xl: "1.25rem",
      "2xl": "1.5rem",
      "3xl": "1.875rem",
      "4xl": "2.25rem",
      "5xl": "2.5rem",
    },
    space: {
      1: "4px",
      2: "8px",
      3: "16px",
      4: "32px",
      5: "64px",
      6: "128px",
    },
    radii: {
      1: "2px",
      2: "4px",
      3: "8px",
      round: "9999px",
    },
    sizes: {
      sm: "48px",
      md: "768px",
      lg: "1024px",
    },
    // fontWeights: {},
    // lineHeights: {},
    // letterSpacings: {},
    // borderWidths: {},
    // borderStyles: {},
    // shadows: {},
    // zIndices: {},
    // transitions: {},
  },
  media: {
    maxMobile: "(max-width: 480px)",
    maxTablet: "(max-width: 768px)",
    maxLaptop: "(max-width: 1024px)",
  },
  utils: utils,
})

export type CSS = Stitches.CSS<typeof config>

type StyleInput<T extends string> = { [key in T]: CSS }
type StyleOutput<T extends string> = { [key in T]: ReturnType<typeof css> }

export const createCSS = <T extends string>(style: StyleInput<T>) => style

/**
 * Solves equations of the form a * x = b
 * @example
 * // Returns styles.container()
 * const styles = createStyles({
 *    container: { color: "$blue11" }
 * })
 *
 * const Text = () => <p className={styles.container()}>Hello World</p>
 *
 * @returns functions to be used in className
 */
export const createStyles = <T extends string>(style: StyleInput<T>): StyleOutput<T> => {
  const styles: { [key in T]: CSS | ReturnType<typeof css> } = style
  for (const key in style) {
    styles[key] = css(style[key] as CSS)
  }
  return styles as StyleOutput<T>
}
