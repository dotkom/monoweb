import { Text } from "theme-ui";

export default {
  title: "atoms/Text",
  component: Text,
};

export const defaultText = () => (
  <Text>
    Default text - Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed imperdiet quam nec metus luctus, sit
    amet vehicula arcu commodo.
  </Text>
);

export const emphasisText = () => (
  <Text variant="emphasis">
    Bold text - Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed imperdiet quam nec metus luctus, sit amet
    vehicula arcu commodo.
  </Text>
);

export const italicText = () => (
  <Text variant="italic">
    Italic text - Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed imperdiet quam nec metus luctus, sit amet
    vehicula arcu commodo.
  </Text>
);

export const strikethroughText = () => (
  <Text variant="strikethrough">
    Strikethrough text - Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed imperdiet quam nec metus luctus,
    sit amet vehicula arcu commodo.
  </Text>
);

export const underlineText = () => (
  <Text variant="underline">
    Underline text - Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed imperdiet quam nec metus luctus, sit
    amet vehicula arcu commodo.
  </Text>
);
