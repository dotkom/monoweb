import { ConfigType } from "@stitches/react/types/config";
import { colors } from "./colors";

export const themeConfig: ConfigType.Theme = {
  colors,
  fonts: {
    body: 'Poppins,system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
    monospace: "Menlo, monospace",
  },
  fontSizes: {
    1: "12px",
    2: "14px",
    3: "16px",
    4: "20px",
    5: "24px",
    6: "32px",
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
  // fontWeights: {},
  // lineHeights: {},
  // letterSpacings: {},
  // borderWidths: {},
  // borderStyles: {},
  // shadows: {},
  // zIndices: {},
  // transitions: {},
};
