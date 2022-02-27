import React from "react";
import { ComponentStory, ComponentMeta } from "@storybook/react";

import Footer from "../Footer";

export default {
  title: "Organisms/Footer",
  component: Footer,
} as ComponentMeta<typeof Button>;

const Template: ComponentStory<typeof Footer> = (args) => <Footer {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  text: "primary",
};
