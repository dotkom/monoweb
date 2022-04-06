import { CSS } from "@stitches/react/types/css-util";

export interface DesktopProps {
  children?: Element[] | Element | string;
  title?: string;
  href?: string;
  css?: CSS<{}, {}, {}, {}>;
}
