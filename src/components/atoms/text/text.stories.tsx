import { Text, TextProps } from "theme-ui";

export default {
  title: "Text",
  component: Text,
};

export const defaultText = (props: TextProps) => <Text>Default text - Lorem
  ipsum dolor sit amet, consectetur adipiscing elit. Sed imperdiet quam nec
  metus luctus, sit amet vehicula arcu commodo.</Text>;

export const emphasisText = (props: TextProps) => <Text variant="emphasis">Bold
  text - Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed imperdiet
  quam nec metus luctus, sit amet vehicula arcu commodo.</Text>;

export const italicText = (props: TextProps) => <Text variant="italic">Italic
  text - Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed imperdiet
  quam nec metus luctus, sit amet vehicula arcu commodo.</Text>;

export const strikethroughText = (props: TextProps) => <Text
  variant="strikethrough">Strikethrough text
  - Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed imperdiet quam
  nec metus luctus, sit amet vehicula arcu commodo.</Text>;

export const underlineText = (props: TextProps) => <Text variant="underline">Underline
  text - Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed imperdiet
  quam nec metus luctus, sit amet vehicula arcu commodo.</Text>;