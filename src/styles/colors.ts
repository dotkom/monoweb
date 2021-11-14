import { Theme } from "theme-ui";

const blue = {
  1: "#0D2546",
  2: "#11325E",
  3: "#153E75",
  4: "#2C5183",
  5: "#446591",
  6: "#5B789E",
  7: "#738BAC",
  8: "#8A9FBA",
  9: "#A1B2C8",
  10: "#B9C5D6",
  11: "#D0D8E3",
  12: "#E8ECF1",
};
const orange = {
  1: "#966E35",
  2: "#C89247",
  3: "#FAB759",
  4: "#FBBE6A",
  5: "#FBC57A",
  6: "#FCCD8B",
  7: "#FCD49B",
  8: "#FDDBAC",
  9: "#FDE2BD",
  10: "#FEE9CD",
  11: "#FEF1DE",
  12: "#FFF8EE",
};

const green = {
  1: "#425845",
  2: "#698C6E",
  3: "#83AF89",
  4: "#8FB795",
  5: "#9CBFA1",
  6: "#A8C7AC",
  7: "#B5CFB8",
  8: "#C1D7C4",
  9: "#CDDFD0",
  10: "#DAE7DC",
  11: "#E6EFE7",
  12: "#F3F7F3",
};

const red = {
  1: "#811722",
  2: "#AC1E2D",
  3: "#D72638",
  4: "#DB3C4C",
  5: "#DF5160",
  6: "#E36774",
  7: "#E77D88",
  8: "#EB939C",
  9: "#EFA8AF",
  10: "#F3BEC3",
  11: "#F7D4D7",
  12: "#FBE9EB",
};

const gray = {
  1: "#2E3440",
  2: "#3D4555",
  3: "#4C566A",
  4: "#5E6779",
  5: "#707888",
  6: "#828997",
  7: "#949AA6",
  8: "#A6ABB5",
  9: "#B7BBC3",
  10: "#C9CCD2",
  11: "#DBDDE1",
  12: "#EDEEF0",
};

export const colors: Theme["colors"] = {
  text: "#000",
  background: "#FBFCFD",
  primary: blue[3],
  secondary: orange[3],
  accent: green[3],
  highlight: orange[10],
  muted: blue[11],
  blue,
  orange,
  green,
  red,
  gray,
  onlineBlue: "#0D5474",
  onlineOrange: "#F9B759",
};
