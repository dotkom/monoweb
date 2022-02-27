import type { Theme } from "theme-ui";
import { colors } from "./colors";
import componentThemes from "./components";
import globalStyles from "./global";
import { typography } from "./typography";

export const theme: Theme = {
  colors,
  space: [0, 4, 8, 16, 32, 64, 128, 256, 512],
  ...typography,
  ...componentThemes,
  styles: globalStyles,
};
