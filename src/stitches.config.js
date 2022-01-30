import { createStitches } from "@stitches/react";
import { themeConfig } from "./theme/theme";
import { utils } from "./theme/utils";

export const { styled, css, globalCss, keyframes, getCssText, theme, createTheme, config } = createStitches({
  theme: themeConfig,
  utils: utils,
});
