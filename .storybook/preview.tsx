import { addDecorator, configure } from "@storybook/react";
import * as NextImage from "next/image";
import { Box } from "../src/components/primitives";
import { globalStyles } from "../src/theme/global-style";

export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
};

const Image = NextImage.default;
Object.defineProperty(NextImage, "default", {
  configurable: true,
  value: (props) => <Image {...props} unoptimized />,
});

addDecorator((story) => {
  globalStyles();
  return <Box css={{ padding: "$4", backgroundColor: "$white" }}>{story()}</Box>;
});

configure([require.context("../src/", true, /\.stories\.(tsx|mdx)$/)], module);
