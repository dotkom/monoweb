import React from "react";

import { ComponentStory, ComponentMeta } from "@storybook/react";
import InterestGroupCard from "../InterestGroupCard";

export default {
  /* 👇 The title prop is optional.
   * See https://storybook.js.org/docs/react/configure/overview#configure-story-loading
   * to learn how to generate automatic titles
   */
  title: "molecules/InterestGroupCard",
  component: InterestGroupCard,
} as ComponentMeta<typeof InterestGroupCard>;

//👇 We create a “template” of how args map to rendering
const Template: ComponentStory<typeof InterestGroupCard> = (args) => <InterestGroupCard {...args} />;

export const Primary = Template.bind({});

const DESC =
  " Interessegruppen for folk som er glad i jul er interessegruppen for, you guessed it, de som er glad i jul.  Gruppens største formål er å spre julens glade budskap, samt spre juleglede når det måtte passe seg.  ";

Primary.args = {
  backgroundImage: "/banner.jpeg",
  description: DESC,
  heading: "Folk som er glad i Jul",
  icon: "/icon.png",
};