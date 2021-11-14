import { Heading } from "theme-ui";

export default {
  title: "atoms/Heading",
  component: Heading,
};

export const firstHeading = () => <Heading as="h1">Lorem ipsum dolor sit</Heading>;
export const secondHeading = () => <Heading as="h2">Lorem ipsum dolor sit</Heading>;
export const thirdHeading = () => <Heading as="h3">Lorem ipsum dolor sit</Heading>;
export const fourthHeading = () => <Heading as="h4">Lorem ipsum dolor sit</Heading>;
export const fifthHeading = () => <Heading as="h5">Lorem ipsum dolor sit</Heading>;
export const sixthHeading = () => <Heading as="h6">Lorem ipsum dolor sit</Heading>;
