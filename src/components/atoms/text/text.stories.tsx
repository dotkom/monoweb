import { Text, TextProps } from "theme-ui";

export default {
  title: "Text",
  component: Text,
};

export const defaultText = (props: TextProps) => <Text>Default text - Lorem
  ipsum dolor sit amet, consectetur adipiscing elit. Sed imperdiet quam nec
  metus luctus, sit amet vehicula arcu commodo.</Text>;
export const emphasisText = (props: TextProps) => <Text variant="emphasis">Bold text
  - Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed imperdiet quam
  nec metus luctus, sit amet vehicula arcu commodo.</Text>;